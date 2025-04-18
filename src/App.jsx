import React, { useState, useEffect, Suspense } from 'react';
const PieChartSection = React.lazy(() => import('./components/PieChartSection'));
import { Analytics } from '@vercel/analytics/react';

import './App.css';

const questions = [
    {
        id: 1,
        question: 'Quantos km você percorre por semana de carro?',
        category: 'Transporte',
        options: [
            { text: 'Nenhum', score: 0 },
            { text: 'Até 50 km', score: 50 },
            { text: '50 a 150 km', score: 100 },
            { text: 'Mais de 150 km', score: 150 },
        ],
    },
    {
        id: 2,
        question: 'Com que frequência você consome carne vermelha?',
        category: 'Alimentação',
        options: [
            { text: 'Nunca', score: 0 },
            { text: '1 a 2 vezes por semana', score: 40 },
            { text: '3 a 5 vezes por semana', score: 80 },
            { text: 'Diariamente', score: 120 },
        ],
    },
    {
        id: 3,
        question: 'Você costuma desligar aparelhos da tomada ou usar energia renovável?',
        category: 'Energia',
        options: [
            { text: 'Sempre', score: 0 },
            { text: 'Às vezes', score: 20 },
            { text: 'Raramente', score: 40 },
            { text: 'Nunca', score: 60 },
        ],
    },
    {
        id: 4,
        question: 'Você separa os resíduos recicláveis em casa?',
        category: 'Reciclagem',
        options: [
            { text: 'Sim', score: 0 },
            { text: 'Parcialmente', score: 15 },
            { text: 'Não', score: 30 },
        ],
    },
    {
        id: 5,
        question: 'Quantos banhos de mais de 10 minutos você toma por semana?',
        category: 'Água',
        options: [
            { text: 'Nenhum', score: 0 },
            { text: '1 a 3', score: 20 },
            { text: '4 a 6', score: 40 },
            { text: '7 ou mais', score: 60 },
        ],
    },
    {
        id: 6,
        question: 'Com que frequência você compra roupas novas?',
        category: 'Consumo',
        options: [
            { text: 'Quase nunca', score: 0 },
            { text: '1 vez por mês', score: 30 },
            { text: '2 a 3 vezes por mês', score: 60 },
            { text: 'Semanalmente', score: 90 },
        ],
    },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BE0', '#FF5D9E'];

export default function EcoCalculator() {
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [history, setHistory] = useState([]);
    const [numeroQuestao, setNumeroQuestao] = useState(1);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('ecoCalculatorResult');
        const savedHistory = localStorage.getItem('ecoCalculatorHistory');
        if (saved) {
            setSubmitted(true);
            setAnswers(JSON.parse(saved));
        }
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    }, []);

    const handleNumeroQuestao = () => {
        if (numeroQuestao >= questions.length) {
            setNumeroQuestao(1);
        } else {
            setNumeroQuestao(numeroQuestao + 1);
        }
    };

    const handleOptionChange = (questionId, score) => {
        setAnswers({ ...answers, [questionId]: score });
        console.log(answers, Object.keys(answers).length);
    };

    const calculateTotal = () => {
        return Object.values(answers).reduce((total, score) => total + score, 0);
    };

    const getFeedback = total => {
        if (total < 100) return 'Excelente! Sua pegada ecológica é baixa.';
        if (total < 250) return 'Bom! Mas ainda há espaço para melhorias.';
        return 'Atenção! Suas ações estão gerando alto impacto ambiental.';
    };

    const getTips = () => {
        const tips = [];
        questions.forEach(q => {
            const score = answers[q.id] || 0;
            if (score > 50) {
                tips.push(`Reavalie seus hábitos em "${q.category}".`);
            }
        });
        return tips;
    };

    const handleSubmit = e => {
        e.preventDefault();
        setSubmitted(true);
        localStorage.setItem('ecoCalculatorResult', JSON.stringify(answers));
        const newEntry = { date: new Date().toLocaleString(), total: calculateTotal() };
        const updatedHistory = [...history, newEntry];
        setHistory(updatedHistory);
        localStorage.setItem('ecoCalculatorHistory', JSON.stringify(updatedHistory));
    };

    const resetForm = () => {
        setSubmitted(false);
        setAnswers({});
        setNumeroQuestao(1);
        localStorage.removeItem('ecoCalculatorResult');
    };

    const clearHistory = () => {
        const updatedHistory = [];
        setHistory(updatedHistory);
        setNumeroQuestao(numeroQuestao + 1);
        localStorage.removeItem('ecoCalculatorHistory');
    };

    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            const html2pdf = await import('html2pdf.js');
            const element = document.getElementById('result-section');
            await html2pdf.default().from(element).save('resultado_pegada_ecologica.pdf');
        } catch (error) {
            console.error('Erro ao exportar PDF:', error);
            alert('Erro ao gerar PDF.');
        }
        setIsExporting(false);
    };

    const chartData = questions.map(q => ({
        name: q.category,
        value: answers[q.id] || 0,
    }));

    return (
        <div className="app">
            <div className="cabecalho">
                <h1>Calculadora de Pegada Ecológica</h1>
            </div>

            {!submitted ? (
                <div className="form-container">
                    <form onSubmit={handleSubmit}>
                        {questions.map(q => (
                            <div
                                key={q.id}
                                className={`question ${
                                    numeroQuestao == q.id ? 'active' : 'inactive'
                                }`}
                            >
                                <p>{`${q.id} - ${q.question}`}</p>

                                {q.options.map((opt, idx) => (
                                    <label key={idx}>
                                        <input
                                            type="radio"
                                            name={`question-${q.id}`}
                                            value={opt.score}
                                            onChange={() => handleOptionChange(q.id, opt.score)}
                                            checked={answers[q.id] === opt.score}
                                            required
                                        />
                                        <span>{opt.text}</span>
                                    </label>
                                ))}
                            </div>
                        ))}

                        {numeroQuestao == questions.length ? (
                            <button
                                type="submit"
                                disabled={Object.keys(answers).length < questions.length}
                            >
                                Calcular
                            </button>
                        ) : (
                            <button
                                className={`${
                                    Object.keys(answers).length < questions.length
                                        ? 'active-btn'
                                        : 'inactive-btn'
                                }`}
                                type="button"
                                onClick={() => handleNumeroQuestao()}
                                disabled={Object.keys(answers).length == numeroQuestao - 1}
                            >
                                Próxima pergunta
                            </button>
                        )}
                    </form>
                </div>
            ) : (
                <div id="result-section">
                    <h2>Resultado</h2>
                    <p>
                        Sua pegada estimada é de <strong>{calculateTotal()}</strong> kg de CO₂ por
                        mês.
                    </p>
                    <p className="feedback">{getFeedback(calculateTotal())}</p>

                    <Suspense fallback={<div>Carregando gráfico...</div>}>
                        <PieChartSection chartData={chartData} />
                    </Suspense>

                    {getTips().length > 0 && (
                        <div>
                            <h3>Dicas Sustentáveis:</h3>
                            <ul>
                                {getTips().map((tip, index) => (
                                    <li key={index}>{tip}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {history.length > 0 && (
                        <div>
                            <h3>Histórico de Resultados:</h3>
                            <ul>
                                {history.map((entry, index) => (
                                    <li key={index}>
                                        {entry.date} — {entry.total} kg CO₂
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="action-buttons">
                        <button onClick={resetForm}>Refazer cálculo</button>
                        <button onClick={handleExportPDF} disabled={isExporting}>
                            {isExporting ? 'Exportando...' : 'Exportar PDF'}
                        </button>
                        <button onClick={clearHistory} className="delete-btn">
                            Excluir histórico
                        </button>
                    </div>
                </div>
            )}
            {/* Vercel Web Analitycs */}
            <Analytics />
            {/* Fim do Vercel Web Analitycs */}
        </div>
    );
}

