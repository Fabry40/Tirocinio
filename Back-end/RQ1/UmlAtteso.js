import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';

export class UmlAtteso {
  // Leggi e parsa un file XMI, restituisce l'oggetto JSON
  static parseXmiFile(filePath) {
    const xmiContent = fs.readFileSync(filePath, 'utf-8');
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    });
    return parser.parse(xmiContent);
  }

  // Estrae classi, associazioni, tipi composti ed enumerazioni da un oggetto XMI già parsato
  static estraiModelCompatto(jsonObj) {
    const model = jsonObj['xmi:XMI']?.['uml:Model'];
    const members = model?.ownedMember;
    const classes = [];
    const relations = [];
    const enumerations = [];
    const idToName = {};

    if (!members) return { classes: [], relations: [], enumerations: [] };

    const elements = Array.isArray(members) ? members : [members];

    // Prima passata: raccogli tutti gli id/nome delle classi, association class e enumeration
    for (const el of elements) {
      if (
        el['@_xmi:type'] === 'uml:Class' ||
        el['@_xmi:type'] === 'uml:AssociationClass' ||
        el['@_xmi:type'] === 'uml:Enumeration'
      ) {
        idToName[el['@_xmi:id']] = el['@_name'];
      }
    }

    // Raccogli tutti gli ownedAttribute di tutte le classi/association per cercare i memberEnd
    let allProperties = [];
    for (const el of elements) {
      if (el.ownedAttribute) {
        const attrs = Array.isArray(el.ownedAttribute) ? el.ownedAttribute : [el.ownedAttribute];
        allProperties = allProperties.concat(attrs);
      }
    }

    // Seconda passata: estrai classi, attributi, metodi, ereditarietà, enumerazioni, relazioni
    for (const el of elements) {
      if (el['@_xmi:type'] === 'uml:Class' || el['@_xmi:type'] === 'uml:AssociationClass') {
        // Attributi e relazioni
        const attributes = [];
        const ownedAttrs = el.ownedAttribute
          ? (Array.isArray(el.ownedAttribute) ? el.ownedAttribute : [el.ownedAttribute])
          : [];
        for (const attr of ownedAttrs) {
          // Funzione di utilità per molteplicità su attributi
          function getAttrMultiplicity(attr) {
            let lower = '';
            let upper = '';
            if (attr.lowerValue && attr.lowerValue['@_value'] !== undefined) {
              lower = attr.lowerValue['@_value'];
            }
            if (attr.upperValue && attr.upperValue['@_value'] !== undefined) {
              upper = attr.upperValue['@_value'];
            }
            if (lower || upper) {
              return lower && upper ? `${lower}..${upper}` : (upper || lower);
            }
            // fallback: vecchio sistema
            return (attr['@_lowerValue'] && attr['@_upperValue'])
              ? `${attr['@_lowerValue']}..${attr['@_upperValue']}`
              : attr['@_upperValue'] || attr['@_lowerValue'] || attr['@_name'] || undefined;
          }

          // Se ha @_association o @_type che punta a un'altra classe, è una relazione
          if (
            (attr['@_association'] && attr['@_type'] && idToName[attr['@_type']]) ||
            (attr['@_type'] && idToName[attr['@_type']])
          ) {
            relations.push({
              from: el['@_name'],
              to: idToName[attr['@_type']] || attr['@_type'],
              type: attr['@_aggregation'] === 'composite'
                ? 'composition'
                : attr['@_aggregation'] === 'shared'
                ? 'aggregation'
                : 'association',
              name: attr['@_name'] || undefined,
              multiplicity: getAttrMultiplicity(attr)
            });
          } else if (attr['@_name']) {
            // MODIFICA: restituisci attributi come oggetti { name, type }
            attributes.push({
              name: attr['@_name'],
              type: attr['@_type'] || null
            });
          }
        }

        // Metodi
        const methods = [];
        const ownedOps = el.ownedOperation
          ? (Array.isArray(el.ownedOperation) ? el.ownedOperation : [el.ownedOperation])
          : [];
        for (const op of ownedOps) {
          if (op['@_name']) methods.push(op['@_name']);
        }

        classes.push({
          name: el['@_name'],
          attributes,
          methods
        });

        // Relazioni di ereditarietà (Generalization)
        const generalizations = el.generalization
          ? (Array.isArray(el.generalization) ? el.generalization : [el.generalization])
          : [];
        for (const gen of generalizations) {
          if (gen['@_general']) {
            relations.push({
              from: el['@_name'],
              to: idToName[gen['@_general']] || gen['@_general'],
              type: 'inheritance',
              name: 'generalization'
            });
          }
        }
      }

      // Enumerazioni
      if (el['@_xmi:type'] === 'uml:Enumeration') {
        const literals = el.ownedLiteral
          ? (Array.isArray(el.ownedLiteral) ? el.ownedLiteral : [el.ownedLiteral])
          : [];
        enumerations.push({
          name: el['@_name'],
          values: literals.map(lit => lit['@_name'])
        });
      }

      // Dipendenze
      if (el['@_xmi:type'] === 'uml:Dependency') {
        // source e target possono essere array o singoli
        const clients = el.client ? (Array.isArray(el.client) ? el.client : [el.client]) : [];
        const suppliers = el.supplier ? (Array.isArray(el.supplier) ? el.supplier : [el.supplier]) : [];
        for (const client of clients) {
          for (const supplier of suppliers) {
            relations.push({
              from: idToName[client['@_xmi:idref']] || client['@_xmi:idref'],
              to: idToName[supplier['@_xmi:idref']] || supplier['@_xmi:idref'],
              type: 'dependency',
              name: el['@_name'] || undefined
            });
          }
        }
      }
    }

    // Associazioni definite come uml:Association e uml:AssociationClass
    for (const el of elements) {
      if (el['@_xmi:type'] === 'uml:Association' || el['@_xmi:type'] === 'uml:AssociationClass') {
        // Cerca ownedEnd normalmente
        let ownedEnds = el.ownedEnd
          ? (Array.isArray(el.ownedEnd) ? el.ownedEnd : [el.ownedEnd])
          : [];
        // Se non ci sono almeno 2 ownedEnd, prova a ricostruirli dai memberEnd (solo per AssociationClass)
        if (ownedEnds.length < 2 && el['@_xmi:type'] === 'uml:AssociationClass' && el.memberEnd) {
          const memberEnds = Array.isArray(el.memberEnd) ? el.memberEnd : [el.memberEnd];
          ownedEnds = memberEnds.map(idref => {
            // idref può essere oggetto o stringa
            const refId = typeof idref === 'string' ? idref : idref['@_xmi:idref'];
            // Cerca tra tutti gli attributi delle classi/association
            return allProperties.find(e => e['@_xmi:id'] === refId);
          }).filter(Boolean);
        }
        if (ownedEnds.length >= 2) {
          const from = idToName[ownedEnds[0]['@_type']] || ownedEnds[0]['@_type'];
          const to = idToName[ownedEnds[1]['@_type']] || ownedEnds[1]['@_type'];

          // Funzione di utilità per estrarre la molteplicità
          function getMultiplicity(end) {
            let lower = '';
            let upper = '';
            if (end.lowerValue && end.lowerValue['@_value'] !== undefined) {
              lower = end.lowerValue['@_value'];
            }
            if (end.upperValue && end.upperValue['@_value'] !== undefined) {
              upper = end.upperValue['@_value'];
            }
            if (lower || upper) {
              return lower && upper ? `${lower}..${upper}` : (upper || lower);
            }
            // fallback: prova con il nome (come già facevi)
            return end['@_name'] || '';
          }

          const multA = getMultiplicity(ownedEnds[0]);
          const multB = getMultiplicity(ownedEnds[1]);

          // Attributi association class
          let associationAttributes = [];
          if (el['@_xmi:type'] === 'uml:AssociationClass' && el.ownedAttribute) {
            const attrs = Array.isArray(el.ownedAttribute) ? el.ownedAttribute : [el.ownedAttribute];
            associationAttributes = attrs.map(a => a['@_name']).filter(Boolean);
          }
          relations.push({
            from,
            to,
            type: el['@_xmi:type'] === 'uml:AssociationClass' ? 'associationClass' : 'association',
            name: el['@_xmi:type'] === 'uml:AssociationClass' ? el['@_name'] : (el['@_name'] || undefined),
            multiplicity: `${multA} - ${multB}`,
            attributes: associationAttributes.length > 0 ? associationAttributes : undefined
          });
        }
      }
    }

    return { classes, relations, enumerations };
  }

  static stampaModelCompatto({ classes, relations, enumerations }, logFn = console.log) {
    logFn('Classi:');
    for (const c of classes) {
      logFn(`- ${c.name}`);
      if (c.attributes.length > 0) {
        logFn('  Attributi: ' + c.attributes.map(a => typeof a === 'string' ? a : a.name).join(', '));
      }
      if (c.methods.length > 0) {
        logFn('  Metodi: ' + c.methods.join(', '));
      }
    }
    if (enumerations.length > 0) {
      logFn('\nEnumerazioni:');
      for (const e of enumerations) {
        logFn(`- ${e.name}: [${e.values.join(', ')}]`);
      }
    }
    if (relations.length > 0) {
      logFn('\nRelazioni:');
      for (const r of relations) {
        logFn(`- ${r.from} -> ${r.to} (${r.type})`);
      }
    }
  }
}