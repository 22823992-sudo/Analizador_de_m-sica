import React, { useState } from 'react';
import { Music, Upload, Loader2, Search, AlertCircle, Repeat, TrendingUp, Target, Brain } from 'lucide-react';

const SheetMusicAnalyzer = () => {
  const [image, setImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  // Sistema RAG: Template almacenado
  const getAnalysisPrompt = () => `Eres un profesor de música experto. Analiza esta partitura enfocándote en PATRONES MELÓDICOS.

Responde SOLO con JSON válido (sin markdown, sin backticks):

{
  "informacion_basica": {
    "tonalidad": "tonalidad completa (ej: Sol menor con Bb y Eb)",
    "compas": "tipo de compás",
    "tempo": "indicación de tempo",
    "clave": "clave usada",
    "total_compases": número
  },
  "patrones_melodicos": [
    {
      "nombre": "nombre descriptivo (ej: 'Escala descendente')",
      "notas_aproximadas": "descripción de notas (ej: 'G-F#-G-A-Bb')",
      "compases": "dónde aparece (ej: '1-2, 7-8')",
      "repeticiones": "cuántas veces",
      "tipo": "escala/arpegio/secuencia/motivo rítmico/cromatismo/salto",
      "importancia": "por qué es importante",
      "como_practicar": "consejo específico"
    }
  ],
  "nivel_dificultad": {
    "general": "principiante/intermedio/avanzado/experto",
    "razones": ["razones específicas"]
  },
  "caracteristicas_tecnicas": {
    "alteraciones_armadura": ["alteraciones en la armadura"],
    "alteraciones_accidentales": ["alteraciones accidentales"],
    "figuras_predominantes": ["figuras más usadas"],
    "tecnicas_requeridas": ["técnicas necesarias"]
  },
  "fragmentos_criticos": [
    {
      "compases": "rango",
      "descripcion": "qué lo hace difícil",
      "como_practicar": "método específico"
    }
  ],
  "consejos_practica": ["consejo 1", "consejo 2"],
  "contexto_musical": {
    "compositor": "compositor",
    "periodo": "período",
    "estilo": "características"
  }
}`;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        setError('');
        setAnalysis(null);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data: base64Image }
              },
              { type: 'text', text: getAnalysisPrompt() }
            ]
          }]
        })
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();
      const text = data.content.filter(i => i.type === 'text').map(i => i.text).join('').trim();
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      setAnalysis(JSON.parse(cleanText));
      
    } catch (err) {
      console.error('Error:', err);
      setError('Error al analizar la partitura. Intenta con una imagen más clara.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Componentes pequeños reutilizables
  const InfoCard = ({ label, value, color = 'indigo' }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className={`text-lg font-bold text-${color}-600`}>{value}</div>
    </div>
  );

  const PatternCard = ({ patron, index }) => {
    const colors = ['blue', 'green', 'purple', 'orange', 'pink', 'cyan', 'red', 'indigo'];
    const color = colors[index % colors.length];
    const icons = {
      'escala': '📊', 'arpegio': '🎼', 'secuencia': '🔁',
      'motivo rítmico': '🥁', 'cromatismo': '🌈', 'salto': '⬆️'
    };
    
    return (
      <div className={`p-6 rounded-xl border-2 border-${color}-500 bg-${color}-50 shadow-lg`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{icons[patron.tipo?.toLowerCase()] || '🎵'}</span>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{patron.nombre}</h3>
                <span className="inline-block bg-white px-3 py-1 rounded-full text-xs font-semibold text-gray-600 mt-1">
                  {patron.tipo}
                </span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg mb-3 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Patrón de notas:</p>
              <p className="text-lg font-mono font-bold text-indigo-700">{patron.notas_aproximadas}</p>
            </div>
          </div>
          <div className="ml-4 text-center bg-white px-5 py-3 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-purple-600">{patron.repeticiones}x</div>
            <div className="text-xs text-gray-600">veces</div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-2">📍 Compases:</p>
            <p className="text-indigo-700 font-bold">{patron.compases}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-2">⭐ Importancia:</p>
            <p className="text-gray-700 text-sm">{patron.importancia}</p>
          </div>
        </div>
        <div className="mt-3 bg-green-100 border-l-4 border-green-500 p-4 rounded-lg">
          <p className="text-sm font-semibold text-green-900 mb-1">💡 Cómo practicar:</p>
          <p className="text-green-800 text-sm">{patron.como_practicar}</p>
        </div>
      </div>
    );
  };

  const getDifficultyColor = (level) => {
    const colors = {
      'principiante': 'bg-green-100 text-green-800 border-green-300',
      'intermedio': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'avanzado': 'bg-orange-100 text-orange-800 border-orange-300',
      'experto': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[level?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-4 mb-6">
          <Music className="w-14 h-14 text-indigo-600" />
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Análisis de Patrones Musicales</h1>
            <p className="text-gray-600 mt-1">Sistema RAG optimizado - Análisis inteligente</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500 p-5 mb-6 rounded-lg">
          <h3 className="font-bold text-indigo-900 mb-3 text-lg">🎯 Beneficios del análisis</h3>
          <div className="grid md:grid-cols-2 gap-3 text-sm text-indigo-800">
            <div className="bg-white p-3 rounded-lg">🔍 <strong>Patrones:</strong> Memoriza más rápido</div>
            <div className="bg-white p-3 rounded-lg">📈 <strong>Dificultad:</strong> Evalúa tu nivel</div>
            <div className="bg-white p-3 rounded-lg">⚠️ <strong>Críticos:</strong> Identifica desafíos</div>
            <div className="bg-white p-3 rounded-lg">💡 <strong>Consejos:</strong> Practica mejor</div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border-4 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="file-upload" />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-700 mb-2">Sube tu partitura</p>
              <p className="text-sm text-gray-500">JPG, PNG - Imagen clara</p>
            </label>
          </div>

          {image && (
            <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-3">Partitura cargada:</h3>
              <img src={image} alt="Partitura" className="max-h-96 mx-auto rounded-lg shadow-md" />
            </div>
          )}

          <button onClick={analyzeSheet} disabled={!image || analyzing}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-3 shadow-lg disabled:cursor-not-allowed">
            {analyzing ? (
              <><Loader2 className="w-6 h-6 animate-spin" />Analizando con IA...</>
            ) : (
              <><Search className="w-6 h-6" />Analizar Partitura</>
            )}
          </button>

          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}
        </div>

        {analysis && (
          <div className="mt-8 space-y-6">
            {/* Info Básica */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-indigo-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Music className="w-6 h-6" />Información Básica
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoCard label="Tonalidad" value={analysis.informacion_basica?.tonalidad} />
                <InfoCard label="Compás" value={analysis.informacion_basica?.compas} />
                <InfoCard label="Tempo" value={analysis.informacion_basica?.tempo} />
              </div>
            </div>

            {/* Patrones */}
            {analysis.patrones_melodicos?.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-300">
                <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                  <Repeat className="w-8 h-8 text-purple-600" />
                  Patrones Melódicos: {analysis.patrones_melodicos.length}
                </h2>
                <p className="text-gray-700 mb-5 text-sm">
                  Fragmentos que se repiten. <strong>Memorizarlos acelera el aprendizaje.</strong>
                </p>
                <div className="space-y-5">
                  {analysis.patrones_melodicos.map((patron, idx) => (
                    <PatternCard key={idx} patron={patron} index={idx} />
                  ))}
                </div>
              </div>
            )}

            {/* Dificultad */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-orange-600" />Nivel de Dificultad
              </h2>
              <div className={`inline-block px-6 py-3 rounded-full border-2 text-lg font-bold mb-4 ${getDifficultyColor(analysis.nivel_dificultad?.general)}`}>
                {analysis.nivel_dificultad?.general?.toUpperCase()}
              </div>
              <ul className="space-y-2 mt-3">
                {analysis.nivel_dificultad?.razones?.map((razon, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
                    <span className="text-indigo-600">•</span>
                    <span className="text-gray-700">{razon}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Técnicas */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Características Técnicas</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <p className="font-semibold text-blue-900 mb-2">🎼 Armadura:</p>
                  <p className="text-blue-800 font-bold">{analysis.caracteristicas_tecnicas?.alteraciones_armadura?.join(', ')}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                  <p className="font-semibold text-purple-900 mb-2">✏️ Accidentales:</p>
                  <p className="text-purple-800 font-bold">{analysis.caracteristicas_tecnicas?.alteraciones_accidentales?.join(', ')}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                  <p className="font-semibold text-green-900 mb-2">🎵 Figuras:</p>
                  <p className="text-green-800">{analysis.caracteristicas_tecnicas?.figuras_predominantes?.join(', ')}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
                  <p className="font-semibold text-orange-900 mb-2">🎯 Técnicas:</p>
                  <p className="text-orange-800">{analysis.caracteristicas_tecnicas?.tecnicas_requeridas?.join(', ')}</p>
                </div>
              </div>
            </div>

            {/* Fragmentos Críticos */}
            {analysis.fragmentos_criticos?.length > 0 && (
              <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-300">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6" />Fragmentos Críticos
                </h2>
                <div className="space-y-4">
                  {analysis.fragmentos_criticos.map((f, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-lg border-l-4 border-yellow-500">
                      <span className="bg-yellow-200 px-3 py-1 rounded-full font-bold text-sm">Compases {f.compases}</span>
                      <p className="text-gray-800 mt-3"><strong className="text-red-700">⚠️ Problema:</strong> {f.descripcion}</p>
                      <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded mt-3">
                        <p className="text-green-800"><strong>💡 Solución:</strong> {f.como_practicar}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Consejos */}
            <div className="bg-green-50 rounded-xl p-6 border-2 border-green-300">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Brain className="w-6 h-6" />Consejos de Práctica
              </h2>
              <div className="space-y-3">
                {analysis.consejos_practica?.map((c, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg border-l-4 border-green-400">
                    <p className="text-gray-800"><span className="font-bold text-green-600">#{idx + 1}</span> {c}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contexto */}
            {analysis.contexto_musical && (
              <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Contexto Musical</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <InfoCard label="Compositor" value={analysis.contexto_musical.compositor} color="purple" />
                  <InfoCard label="Período" value={analysis.contexto_musical.periodo} color="purple" />
                  <InfoCard label="Estilo" value={analysis.contexto_musical.estilo} color="purple" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-sm text-gray-600 bg-white rounded-lg p-4 shadow">
        <p className="font-semibold mb-2">🎵 Sistema RAG optimizado</p>
        <p>Componentes reutilizables • Código limpio • Análisis eficiente</p>
      </div>
    </div>
  );
};

export default SheetMusicAnalyzer;