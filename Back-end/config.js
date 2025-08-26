// Scegli quale sperimentazione eseguire:
// "Voto" → valuta automaticamente tutti i file XMI presenti in directoryCampioni confrontandoli con xmiFile (modello atteso) e confrontando anche un modello ccreato da IA.
// "main" → confronta direttamente il PDF indicato (pdfFile) con il file XMI indicato (xmiFile) e calcola la similarità rispeto al modello generato dall'LLM.
export const experiment = "main";

// Scegli quale IA utilizzare per la generazione del modello UML:
// "deepSeek" → usa OpenRouter con DeepSeek
// "meta" → usa OpenRouter con Meta, attualmente non disponibile
// "gemini" → usa Google Gemini
export const aiProvider = "deepSeek";

// Nome del file PDF della traccia da analizzare.  
// Inserisci qui il nome del file PDF che descrive la traccia da valutare (deve essere presente nella cartella corretta, es: Traccia/).
export const pdfFile = "ToDo.pdf";

// Nome del file XMI atteso (solitamente la soluzione del docente).
// Questo file rappresenta il modello UML di riferimento contro cui verranno confrontati i modelli degli studenti o generati dall’IA.
export const xmiFile = "ToDo.xmi";

// Nome base del file di log dove saranno salvati i risultati (senza estensione).
// Il file di log conterrà tutti i dettagli dei confronti e verrà creato nella cartella Back-end.
export const logFile = "ToDo";

// Cartella dove si trovano i file XMI degli studenti o dei campioni da valutare.(serve solo se scegli Voto)
// Tutti i file XMI presenti in questa cartella verranno valutati se experiment è "Voto".
export const directoryCampioni = "../Aeroporto";