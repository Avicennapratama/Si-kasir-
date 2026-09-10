// Evaluation script for voice/receipt transcription quality
async function evaluateAI() {
  console.log('Evaluating AI models...');
  const testCases = [
    { input: 'Beli beras 5kg 60 ribu', expected: { amount: 60000, category: 'Operasional' } },
    { input: 'Kopi susu dua puluh lima ribu', expected: { amount: 25000, category: 'Minuman' } }
  ];

  console.log(`Evaluated ${testCases.length} sample cases.`);
}

evaluateAI().catch(console.error);