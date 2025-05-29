import natural from 'natural';

export class UMLComparator {

  static normalizeName(name) {
    if (!name) return "";
    return name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  // Usa la similarità Jaro-Winkler
  static nameSimilarity(a, b) {
    a = UMLComparator.normalizeName(a);
    b = UMLComparator.normalizeName(b);
    return natural.JaroWinklerDistance(a, b);
  }

  static findClosestMatch(classA, classesB) {
    const nameA = UMLComparator.normalizeName(classA.name);
    let bestMatch = null;
    let bestScore = 0;

    classesB.forEach(classB => {
      const nameB = UMLComparator.normalizeName(classB.name);
      const score = UMLComparator.nameSimilarity(nameA, nameB);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = classB;
      }
    });

    return { match: bestMatch, score: bestScore };
  }

  static equivalentMultiplicity(multA, multB) {
    const normalize = (m) => {
      if (!m) return '';
      return m.replace(/\s/g, '').toLowerCase();
    };

    const normA = normalize(multA);
    const normB = normalize(multB);

    const aliases = {
      '*': ['0..*', '*', '1..*'],
      '1': ['1..1'],
      '0..1': ['optional'],
    };

    const isEquivalent = (a, b) => {
      if (a === b) return true;
      for (const key in aliases) {
        if (aliases[key].includes(a) && aliases[key].includes(b)) {
          return true;
        }
      }
      return false;
    };

    return isEquivalent(normA, normB);
  }

  // Modificato per essere meno severo e usare matchedClasses e direzionalità inversa
  static matchRelation(rel, relationsB, classesA, classesB, matchedClasses = [], debug = false) {
    const fromA = UMLComparator.normalizeName(rel.from);
    const toA = UMLComparator.normalizeName(rel.to);
    const typeA = rel.type ? rel.type.toLowerCase() : '';

    // Soglia più bassa per sinonimi e nomi simili
    const THRESHOLD = 0.3;

    // Funzione di supporto per trovare match tra classi abbinate
    function isMatchedClass(nameA, nameB) {
      return (
        UMLComparator.nameSimilarity(nameA, nameB) >= THRESHOLD ||
        matchedClasses.some(
          (pair) =>
            (UMLComparator.normalizeName(pair.classA.name) === nameA &&
             UMLComparator.normalizeName(pair.classB.name) === nameB) ||
            (UMLComparator.normalizeName(pair.classB.name) === nameA &&
             UMLComparator.normalizeName(pair.classA.name) === nameB)
        )
      );
    }

    for (const relB of relationsB) {
      const fromB = UMLComparator.normalizeName(relB.from);
      const toB = UMLComparator.normalizeName(relB.to);
      const typeB = relB.type ? relB.type.toLowerCase() : '';

      // Normale
      const fromMatch = isMatchedClass(fromA, fromB);
      const toMatch = isMatchedClass(toA, toB);

      // Inversa
      const fromMatchInv = isMatchedClass(fromA, toB);
      const toMatchInv = isMatchedClass(toA, fromB);

      // Confronta anche la molteplicità
      const multA = rel.multiplicity || '';
      const multB = relB.multiplicity || '';
      const multMatch = UMLComparator.equivalentMultiplicity(multA, multB);

      // Confronta anche il tipo di relazione (association, aggregation, composition, inheritance)
      const typeMatch = typeA === typeB || !typeA || !typeB;

      if ((fromMatch && toMatch && multMatch && typeMatch) ||
          (fromMatchInv && toMatchInv && multMatch && typeMatch)) {
        return true;
      }
    }

    return false;
  }

  static compareUMLModels(modelA, modelB, weights = { class: 0.4, attr: 0.2, method: 0.2, relation: 0.2 }) {
    let totalScore = 0;
    let totalWeight = 0;
    const matchedClasses = [];

    // Match tra classi
    modelA.classes.forEach(classA => {
      const { match: classB, score: nameSimilarity } = UMLComparator.findClosestMatch(classA, modelB.classes);
      if (classB && nameSimilarity > 0.7) {
        matchedClasses.push({ classA, classB, nameSimilarity });
      }
    });

    // Similarità classi
    const classSim = matchedClasses.length > 0
      ? matchedClasses.reduce((acc, pair) => acc + pair.nameSimilarity, 0) / Math.max(modelA.classes.length, modelB.classes.length)
      : 0;

    totalScore += classSim * weights.class;
    totalWeight += weights.class;

    // Similarità attributi e metodi
    let attrScore = 0;
    let methodScore = 0;

    matchedClasses.forEach(({ classA, classB }) => {
      const attrA = (classA.attributes || []).map(a => UMLComparator.normalizeName(a.name || a));
      const attrB = (classB.attributes || []).map(a => UMLComparator.normalizeName(a.name || a));
      attrScore += natural.JaroWinklerDistance(attrA.join(' '), attrB.join(' '));

      const methA = (classA.methods || []).map(m => UMLComparator.normalizeName(m.name || m));
      const methB = (classB.methods || []).map(m => UMLComparator.normalizeName(m.name || m));
      methodScore += natural.JaroWinklerDistance(methA.join(' '), methB.join(' '));
    });

    // Media normalizzata solo se ci sono match
    if (matchedClasses.length > 0) {
      attrScore /= matchedClasses.length;
      methodScore /= matchedClasses.length;
    }

    // Aggiungi ai punteggi pesati
    totalScore += attrScore * weights.attr;
    totalWeight += weights.attr;

    totalScore += methodScore * weights.method;
    totalWeight += weights.method;

    // Similarità relazioni
    let matchedRelations = 0;
    modelA.relations.forEach(rel => {
      if (UMLComparator.matchRelation(rel, modelB.relations, modelA.classes, modelB.classes, matchedClasses)) {
        matchedRelations++;
      }
    });

    const relScore = modelA.relations.length > 0
      ? matchedRelations / Math.max(modelA.relations.length, modelB.relations.length, 1)
      : 0;

    totalScore += relScore * weights.relation;
    totalWeight += weights.relation;

    // Similarità totale normalizzata
    const finalSimilarity = totalWeight > 0
      ? +(totalScore / totalWeight).toFixed(3)
      : 0;

    return {
      similarity: finalSimilarity,
      details: {
        classSimilarity: +classSim.toFixed(3),
        attributeSimilarity: +attrScore.toFixed(3),
        methodSimilarity: +methodScore.toFixed(3),
        relationSimilarity: +relScore.toFixed(3)
      },
      matchedClasses: matchedClasses.map(({ classA, classB, nameSimilarity }) => ({
        from: classA.name,
        to: classB.name,
        similarity: +nameSimilarity.toFixed(2)
      }))
    };
  }
}