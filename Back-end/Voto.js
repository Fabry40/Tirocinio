import natural from 'natural';

export class SimilaritaNumeroErrori {
  static normalizeName(name) {
    if (!name) return "";
    return name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  static nameSimilarity(a, b) {
    a = SimilaritaNumeroErrori.normalizeName(a);
    b = SimilaritaNumeroErrori.normalizeName(b);
    return natural.JaroWinklerDistance(a, b);
  }

  static findClosestMatch(nameA, namesB, threshold = 0.85) {
    let bestMatch = null;
    let bestScore = 0;
    namesB.forEach(nameB => {
      const score = SimilaritaNumeroErrori.nameSimilarity(nameA, nameB);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = nameB;
      }
    });
    return bestScore >= threshold ? bestMatch : null;
  }

  static compareClasses(classiProf, classiStud, threshold) {
    let errori = 0;
    classiProf.forEach(name => {
      if (!SimilaritaNumeroErrori.findClosestMatch(name, classiStud, threshold)) errori++;
    });
    classiStud.forEach(name => {
      if (!SimilaritaNumeroErrori.findClosestMatch(name, classiProf, threshold)) errori++;
    });
    return errori;
  }

  static compareAttributes(modelProf, modelStud, threshold) {
    let errori = 0;
    modelProf.classes.forEach(profClass => {
      const studClass = modelStud.classes.find(
        c => SimilaritaNumeroErrori.nameSimilarity(c.name, profClass.name) >= threshold
      );
      const attrProf = (profClass.attributes || []).map(a => a.name || a);
      if (studClass) {
        const attrStud = (studClass.attributes || []).map(a => a.name || a);
        attrProf.forEach(name => {
          if (!SimilaritaNumeroErrori.findClosestMatch(name, attrStud, threshold)) errori++;
        });
        attrStud.forEach(name => {
          if (!SimilaritaNumeroErrori.findClosestMatch(name, attrProf, threshold)) errori++;
        });
      } else {
        errori += attrProf.length;
      }
    });
    return errori;
  }

  static compareEnumerations(enumProf, enumStud, threshold) {
    let errori = 0;
    enumProf.forEach(name => {
      if (!SimilaritaNumeroErrori.findClosestMatch(name, enumStud, threshold)) errori++;
    });
    enumStud.forEach(name => {
      if (!SimilaritaNumeroErrori.findClosestMatch(name, enumProf, threshold)) errori++;
    });
    return errori;
  }

  static compareRelations(relProf, relStud) {
    let errori = 0;
    const relKey = r => `${r.from}->${r.to}`;
    const relProfKeys = relProf.map(relKey);
    const relStudKeys = relStud.map(relKey);

    relProfKeys.forEach(key => {
      if (!relStudKeys.includes(key)) errori++;
    });
    relStudKeys.forEach(key => {
      if (!relProfKeys.includes(key)) errori++;
    });
    return errori;
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

  static compareMultiplicity(relProf, relStud) {
    let errori = 0;
    relProf.forEach(rp => {
      const rs = relStud.find(rs => rs.from === rp.from && rs.to === rp.to);
      if (!rs || !SimilaritaNumeroErrori.equivalentMultiplicity(rp.multiplicity, rs.multiplicity)) errori++;
    });
    return errori;
  }

  static compareGeneralizations(genProf, genStud) {
    let errori = 0;
    const relKey = r => `${r.from}->${r.to}`;
    const genProfKeys = genProf.map(relKey);
    const genStudKeys = genStud.map(relKey);

    genProfKeys.forEach(key => {
      if (!genStudKeys.includes(key)) errori++;
    });
    genStudKeys.forEach(key => {
      if (!genProfKeys.includes(key)) errori++;
    });
    return errori;
  }

  static isId(name) {
    name = SimilaritaNumeroErrori.normalizeName(name);
    return name === 'id' || name.endsWith('id');
  }

 static similaritaVoto(modelProf, modelStud, logFunction = null) {
  const THRESHOLD = 0.3;
  let errori = 0;
  let erroriDettaglio = [];

  // 1. Classi
  const classiProf = modelProf.classes.map(c => c.name);
  const classiStud = modelStud.classes.map(c => c.name);
  if (SimilaritaNumeroErrori.compareClasses(classiProf, classiStud, THRESHOLD) > 0) {
    errori++;
    erroriDettaglio.push("Classi");
  }

  // 2. Attributi
  if (SimilaritaNumeroErrori.compareAttributes(modelProf, modelStud, THRESHOLD) > 0) {
    errori++;
    erroriDettaglio.push("Attributi");
  }

  // 3. Associazioni
  const relProf = (modelProf.relations || []).filter(r => r.type === 'association');
  const relStud = (modelStud.relations || []).filter(r => r.type === 'association');
  if (SimilaritaNumeroErrori.compareRelations(relProf, relStud) > 0) {
    errori++;
    erroriDettaglio.push("Associazioni");
  }

  // 4. Molteplicità
  if (SimilaritaNumeroErrori.compareMultiplicity(relProf, relStud) > 0) {
    errori++;
    erroriDettaglio.push("Molteplicità");
  }

  // 5. Enumerazioni
  const enumProf = (modelProf.enumerations || []).map(e => e.name);
  const enumStud = (modelStud.enumerations || []).map(e => e.name);
  if (SimilaritaNumeroErrori.compareEnumerations(enumProf, enumStud, THRESHOLD) > 0) {
    errori++;
    erroriDettaglio.push("Enumerazioni");
  }

  // 6. Generalizzazioni
  const genProf = (modelProf.relations || []).filter(r => r.type === 'generalization');
  const genStud = (modelStud.relations || []).filter(r => r.type === 'generalization');
  if (SimilaritaNumeroErrori.compareGeneralizations(genProf, genStud) > 0) {
    errori++;
    erroriDettaglio.push("Generalizzazioni");
  }

  // 7. Attributo id
  let idError = false;
  modelStud.classes.forEach(studClass => {
    (studClass.attributes || []).forEach(attr => {
      const attrName = attr.name || attr;
      if (SimilaritaNumeroErrori.isId(attrName)) idError = true;
    });
  });
  if (idError) {
    errori++;
    erroriDettaglio.push("Attributo id");
  }
  

  // Stampa le categorie di errore trovate (console e log se fornito)
  const errorMessage = erroriDettaglio.length > 0 
    ? "Categorie di errore riscontrate: " + erroriDettaglio.join(", ")
    : "Nessun errore riscontrato.";
  
  console.log(errorMessage);
  if (logFunction) {
    logFunction(errorMessage);
  }

  // Restituisce un numero da 0 a 7
  return errori;
}
}