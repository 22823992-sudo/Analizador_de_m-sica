import React, { useState } from 'react';
import { Music, Upload, Loader2, Search, AlertCircle } from 'lucide-react';

const SheetMusicAnalyzer = () => {
  const [image, setImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [sequence, setSequence] = useState([]);
  const [rhythm, setRhythm] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [error, setError] = useState('');

  const noteMap = {
    '1': 'Do', '1#': 'Do#', '1b': 'Dob',
    '2': 'Re', '2#': 'Re#', '2b': 'Reb',
    '3': 'Mi', '3#': 'Mi#', '3b': 'Mib',
    '4': 'Fa', '4#': 'Fa#', '4b': 'Fab',
    '5': 'Sol', '5#': 'Sol#', '5b': 'Solb',
    '6': 'La', '6#': 'La#', '6b': 'Lab',
    '7': 'Si', '7#': 'Si#', '7b': 'Sib'
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        setError('');
        setSequence([]);
        setPatterns([]);
        setRhythm([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeSheet = async () => {
    if (!image) {
      setError('Por favor sube una imagen de la partitura');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      const base64Image = image.split(',')[1];
      const mediaType = image.split(';')[0].split(':')[1];

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2500,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: mediaType,
                    data: base64Image
                  }
                },
                {
                  type: 'text',
                  text: `Analiza esta partitura musical y extrae la información en formato JSON.

IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown, sin backticks.

SISTEMA DE NOTACIÓN:
- Notas naturales: 1=Do/C, 2=Re/D, 3=Mi/E, 4=Fa/F, 5=Sol/G, 6=La/A, 7=Si/B
- Sostenidos: agrega "#" después del número (ejemplo: "1#" para Do#, "4#" para Fa#)
- Bemoles: agrega "b" después del número (ejemplo: "7b" para Sib, "3b" para Mib)

El JSON debe tener esta estructura exacta:
{
  "notas": [array de strings con números 1-7 y sus alteraciones, ejemplo: ["1", "1#", "2", "3b", "4", "5", "5#", "6", "7b"]],
  "figuras": [array de strings: "redonda", "blanca", "negra", "corchea", "semicorchea", "fusa"],
  "compases": número total de compases,
  "clave": "clave detectada (sol, fa, do)"
}

INSTRUCCIONES DETALLADAS:
1. Lee las notas de izquierda a derecha, compás por compás
2. Identifica la armadura de clave (sostenidos o bemoles al inicio)
3. Detecta TODOS los sostenidos (#) y bemoles (♭) individuales en las notas
4. Las alteraciones afectan solo a esa nota específica en ese compás
5. Una nota sin alteración visible es una nota natural (1-7 sin sufijo)

Ejemplo de respuesta válida:
{"notas": ["5", "5", "5", "3", "5", "5", "5", "3"], "figuras": ["corchea", "corchea", "corchea", "corchea", "negra", "negra", "blanca", "blanca"], "compases": 2, "clave": "sol"}

Si no puedes leer la partitura claramente, responde con:
{"error": "No se pudo leer la partitura claramente"}

Sé muy preciso con las alteraciones. Revisa cuidadosamente cada nota.`
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('')
        .trim();
      
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const result = JSON.parse(cleanText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setSequence(result.notas || []);
      setRhythm(result.figuras || []);
      findPatterns(result.notas || []);
      
    } catch (err) {
      console.error('Error completo:', err);
      setError('Error al analizar la partitura. Verifica que la imagen sea clara y contenga notación musical estándar.');
    } finally {
      setAnalyzing(false);
    }
  };

  const findPatterns = (seq) => {
    if (seq.length < 4) {
      setPatterns([]);
      return;
    }

    const foundPatterns = [];
    const maxPatternLength = Math.min(Math.floor(seq.length / 2), 8);

    for (let len = 2; len <= maxPatternLength; len++) {
      for (let start = 0; start <= seq.length - len; start++) {
        const pattern = seq.slice(start, start + len);
        const occurrences = [];
        
        for (let i = 0; i <= seq.length - len; i++) {
          const candidate = seq.slice(i, i + len);
          if (pattern.every((note, idx) => note === candidate[idx])) {
            occurrences.push(i);
          }
        }

        if (occurrences.length >= 2) {
          const patternKey = pattern.join('-');
          const exists = foundPatterns.some(p => p.pattern.join('-') === patternKey);
          if (!exists) {
            foundPatterns.push({ 
              pattern, 
              occurrences, 
              count: occurrences.length, 
              length: len 
            });
          }
        }
      }
    }

    setPatterns(foundPatterns.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.length - a.length;
    }));
  };

  const getColorForPattern = (index) => {
    const colors = [
      'bg-blue-200 border-blue-500',
      'bg-green-200 border-green-500',
      'bg-yellow-200 border-yellow-500',
      'bg-purple-200 border-purple-500',
      'bg-pink-200 border-pink-500',
      'bg-orange-200 border-orange-500',
      'bg-cyan-200 border-cyan-500',
      'bg-red-200 border-red-500'
    ];
    return colors[index % colors.length];
  };

  const renderNote = (note) => {
    const noteName = noteMap[note] || note;
    const hasAlteration = note.includes('#') || note.includes('b');
    
    return (
      <div className="flex flex-col items-center">
        <span className="font-bold text-xl">{noteName}</span>
        {hasAlteration && (
          <span className="text-xs text-indigo-600 font-bold">
            {note.includes('#') ? '♯' : '♭'}
          </span>
        )}
      </div>
    );
  };

  const renderSequence = () => {
    if (sequence.length === 0) return null;

    const highlighted = sequence.map((note, idx) => ({
      note,
      rhythm: rhythm[idx] || null,
      patterns: []
    }));

    patterns.forEach((pattern, patternIdx) => {
      pattern.occurrences.forEach(start => {
        for (let i = 0; i < pattern.length; i++) {
          if (start + i < highlighted.length) {
            highlighted[start + i].patterns.push(patternIdx);
          }
        }
      });
    });

    return (
      <div className="flex flex-wrap gap-2">
        {highlighted.map((item, idx) => {
          const hasPattern = item.patterns.length > 0;
          const color = hasPattern ? getColorForPattern(item.patterns[0]) : 'bg-white border-gray-300';
          const hasAlteration = item.note.includes('#') || item.note.includes('b');
          
          return (
            <div key={idx} className={`p-3 rounded-lg border-2 ${color} text-center min-w-[70px] shadow-sm transition-all hover:scale-105 ${hasAlteration ? 'ring-2 ring-indigo-300' : ''}`}>
              {renderNote(item.note)}
              <div className="text-sm text-gray-600 mt-1">{item.note}</div>
              {item.rhythm && (
                <div className="text-xs text-gray-700 mt-1 capitalize">{item.rhythm}</div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <Music className="w-12 h-12 text-indigo-600" />
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Analizador de Partituras</h1>
            <p className="text-gray-600 mt-1">Sube una partitura y detecta patrones automáticamente con IA</p>
            <p className="text-sm text-indigo-600 mt-1">✨ Ahora con soporte para sostenidos (#) y bemoles (♭)</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border-4 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleImageUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Haz clic para subir una partitura
              </p>
              <p className="text-sm text-gray-500">
                Formatos: JPG, PNG, PDF (imagen escaneada)
              </p>
            </label>
          </div>

          {image && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Partitura cargada:</h3>
              <img src={image} alt="Partitura" className="max-h-96 mx-auto rounded-lg shadow-md" />
            </div>
          )}

          <button
            onClick={analyzeSheet}
            disabled={!image || analyzing}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-3 shadow-lg disabled:cursor-not-allowed"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Analizando partitura con IA...
              </>
            ) : (
              <>
                <Search className="w-6 h-6" />
                Analizar Partitura
              </>
            )}
          </button>

          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}
        </div>

        {sequence.length > 0 && (
          <div className="mt-8 space-y-6">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Secuencia extraída:</h2>
              {renderSequence()}
              <div className="mt-4 p-4 bg-white rounded-lg">
                <p className="font-mono text-lg text-gray-700">
                  <span className="font-semibold">Notación:</span> {sequence.join(', ')}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Total de notas: {sequence.length} | 
                  Alteraciones: {sequence.filter(n => n.includes('#') || n.includes('b')).length}
                </p>
              </div>
              
              <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <p className="text-sm font-semibold text-indigo-800 mb-2">📖 Leyenda:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="font-mono">1-7</span>: Notas naturales
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-mono">#</span>: Sostenido (♯)
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-mono">b</span>: Bemol (♭)
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-indigo-200 rounded border-2 border-indigo-400"></span>: Con alteración
                  </div>
                </div>
              </div>
            </div>

            {patterns.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  ✨ Patrones encontrados: {patterns.length}
                </h2>
                <div className="space-y-4">
                  {patterns.map((pattern, idx) => (
                    <div key={idx} className={`p-5 rounded-xl border-2 ${getColorForPattern(idx)} shadow-md hover:shadow-lg transition-shadow`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="font-bold text-xl text-gray-800">
                            Patrón #{idx + 1}:
                          </span>
                          <div className="mt-2 flex gap-2 flex-wrap">
                            {pattern.pattern.map((n, i) => (
                              <span key={i} className="px-3 py-2 bg-white rounded-lg font-semibold shadow-sm flex flex-col items-center min-w-[60px]">
                                {renderNote(n)}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right bg-white px-4 py-2 rounded-lg shadow-sm">
                          <div className="text-lg font-bold text-indigo-600">
                            {pattern.count}x
                          </div>
                          <div className="text-xs text-gray-600">
                            repeticiones
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700 bg-white px-3 py-2 rounded-lg">
                        <span className="font-semibold">Posiciones:</span> {pattern.occurrences.map(o => o + 1).join(', ')}
                      </div>
                      <div className="text-xs text-gray-600 bg-white px-3 py-2 rounded-lg mt-2">
                        <span className="font-semibold">Secuencia:</span> {pattern.pattern.join(' → ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {patterns.length === 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
                <p className="text-yellow-800 font-medium">
                  ℹ️ No se encontraron patrones repetitivos en esta secuencia.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-sm text-gray-600">
        <p>💡 Tip: Las partituras con mejor calidad producen mejores resultados</p>
        <p className="mt-1">♯ Sostenidos y ♭ Bemoles son detectados automáticamente</p>
      </div>
    </div>
  );
};

export default SheetMusicAnalyzer;