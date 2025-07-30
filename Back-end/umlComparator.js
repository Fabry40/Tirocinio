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

  static findClosestMatch(classA, classesB, minThreshold = 0.6) {
    const nameA = UMLComparator.normalizeName(classA.name);
    let bestMatch = null;
    let bestScore = 0;

    classesB.forEach(classB => {
      const nameB = UMLComparator.normalizeName(classB.name);
      const score = UMLComparator.nameSimilarity(nameA, nameB);
      if (score > bestScore && score >= minThreshold) {
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

  static matchRelation(rel, relationsB, classesA, classesB, matchedClasses = [], debug = false) {
    const fromA = UMLComparator.normalizeName(rel.from);
    const toA = UMLComparator.normalizeName(rel.to);
    const typeA = rel.type ? rel.type.toLowerCase() : '';

    const THRESHOLD = 0.3;

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

      const fromMatch = isMatchedClass(fromA, fromB);
      const toMatch = isMatchedClass(toA, toB);
      const typeMatch = typeA === typeB;

      if (fromMatch && toMatch && typeMatch) {
        return true;
      }
    }

    return false;
  }

  static compareUMLModels(modelA, modelB, weights = { class: 0.4, attr: 0.2, method: 0.2, relation: 0.2 }) {
    let totalScore = 0;
    let totalWeight = 0;
    const matchedClasses = [];
    const MIN_CLASS_SIMILARITY = 0.6;

    // Match tra classi con soglia minima - algoritmo greedy migliorato
    const availableClassesB = [...modelB.classes];
    
    // Ordina le classi A per nome per un matching più deterministico
    const sortedClassesA = [...modelA.classes].sort((a, b) => a.name.localeCompare(b.name));
    
    sortedClassesA.forEach(classA => {
      let bestMatch = null;
      let bestScore = 0;
      let bestIndex = -1;
      
      // Trova il miglior match disponibile
      availableClassesB.forEach((classB, index) => {
        const score = UMLComparator.nameSimilarity(classA.name, classB.name);
        if (score >= MIN_CLASS_SIMILARITY && score > bestScore) {
          bestScore = score;
          bestMatch = classB;
          bestIndex = index;
        }
      });
      
      if (bestMatch) {
        matchedClasses.push({ classA, classB: bestMatch, nameSimilarity: bestScore });
        // Rimuovi la classe matchata dalla lista disponibile
        availableClassesB.splice(bestIndex, 1);
      }
    });

    // Calcolo similarità classi con penalizzazione per classi mancanti
    const totalClassesA = modelA.classes.length;
    const totalClassesB = modelB.classes.length;
    const maxClasses = Math.max(totalClassesA, totalClassesB);
    
    let classSim = 0;
    if (maxClasses > 0) {
      const matchedScore = matchedClasses.reduce((acc, pair) => acc + pair.nameSimilarity, 0);
      // Penalizzazione più severa per classi non matchate
      const unmatchedClasses = maxClasses - matchedClasses.length;
      const unmatchedPenalty = (unmatchedClasses / maxClasses) * 0.8;
      classSim = Math.max(0, (matchedScore / maxClasses) - unmatchedPenalty);
    }

    totalScore += classSim * weights.class;
    totalWeight += weights.class;

    // Analisi delle differenze integrate
    const differences = UMLComparator.analyzeDifferences(modelA, modelB, matchedClasses);

    // Similarità attributi e metodi
    let attrScore = 0;
    let methodScore = 0;

    matchedClasses.forEach(({ classA, classB }) => {
      const attrA = (classA.attributes || []).map(a => UMLComparator.normalizeName(a.name || a));
      const attrB = (classB.attributes || []).map(a => UMLComparator.normalizeName(a.name || a));
      const methA = (classA.methods || []).map(m => UMLComparator.normalizeName(m.name || m));
      const methB = (classB.methods || []).map(m => UMLComparator.normalizeName(m.name || m));

      const attrSim = natural.JaroWinklerDistance(attrA.join(' '), attrB.join(' '));
      const methSim = natural.JaroWinklerDistance(methA.join(' '), methB.join(' '));

      attrScore += attrSim;
      methodScore += methSim;
    });

    if (matchedClasses.length > 0) {
      attrScore /= matchedClasses.length;
      methodScore /= matchedClasses.length;
    }

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
      })),
      differences: differences
    };
  }

  static analyzeDifferences(modelA, modelB, matchedClasses) {
    const differences = {
      missingClasses: [],
      extraClasses: [],
      missingAttributes: [],
      extraAttributes: [],
      missingRelations: [],
      extraRelations: [],
      wrongRelationTypes: []
    };

    // Classi mancanti: quelle di A che non hanno un match valido
    differences.missingClasses = modelA.classes.filter(classA => 
      !matchedClasses.some(pair => pair.classA === classA)
    );

    // Classi extra: quelle di B che non sono state matchate
    differences.extraClasses = modelB.classes.filter(classB => 
      !matchedClasses.some(pair => pair.classB === classB)
    );

    // Analizza attributi per classi corrispondenti (usa i match trovati)
    matchedClasses.forEach(({ classA, classB }) => {
      const attrsA = new Set((classA.attributes || []).map(a => 
        (a.name || a).toLowerCase()
      ));
      const attrsB = new Set((classB.attributes || []).map(a => 
        (a.name || a).toLowerCase()
      ));

      const missingAttrs = (classA.attributes || []).filter(a => 
        !attrsB.has((a.name || a).toLowerCase())
      );
      const extraAttrs = (classB.attributes || []).filter(a => 
        !attrsA.has((a.name || a).toLowerCase())
      );

      if (missingAttrs.length > 0) {
        differences.missingAttributes.push({
          className: classA.name,
          attributes: missingAttrs
        });
      }
      if (extraAttrs.length > 0) {
        differences.extraAttributes.push({
          className: classB.name,
          attributes: extraAttrs
        });
      }
    });

    // Analizza relazioni
    differences.missingRelations = modelA.relations.filter(relA => 
      !modelB.relations.some(relB => 
        UMLComparator.relationsMatch(relA, relB)
      )
    );

    differences.extraRelations = modelB.relations.filter(relB => 
      !modelA.relations.some(relA => 
        UMLComparator.relationsMatch(relA, relB)
      )
    );

    // Trova relazioni con tipo sbagliato
    modelA.relations.forEach(relA => {
      const correspondingRelB = modelB.relations.find(relB => 
        (UMLComparator.normalizeName(relA.from) === UMLComparator.normalizeName(relB.from) && 
         UMLComparator.normalizeName(relA.to) === UMLComparator.normalizeName(relB.to)) ||
        (UMLComparator.normalizeName(relA.from) === UMLComparator.normalizeName(relB.to) && 
         UMLComparator.normalizeName(relA.to) === UMLComparator.normalizeName(relB.from))
      );
      
      if (correspondingRelB && relA.type !== correspondingRelB.type) {
        differences.wrongRelationTypes.push({
          expected: relA,
          actual: correspondingRelB
        });
      }
    });

    return differences;
  }

  static relationsMatch(relA, relB) {
    // Usa la stessa normalizzazione delle classi per coerenza
    const normalizeForRelation = (name) => name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    
    return (
      normalizeForRelation(relA.from) === normalizeForRelation(relB.from) &&
      normalizeForRelation(relA.to) === normalizeForRelation(relB.to) &&
      relA.type === relB.type
    ) || (
      normalizeForRelation(relA.from) === normalizeForRelation(relB.to) &&
      normalizeForRelation(relA.to) === normalizeForRelation(relB.from) &&
      relA.type === relB.type
    );
  }
}