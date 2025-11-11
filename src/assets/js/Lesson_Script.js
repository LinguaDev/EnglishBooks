/**
 * lesson_scripts.js
 * * Este script inicializa y gestiona la lógica para los juegos interactivos:
 * 1. Fill-in-the-blank (Completar espacios)
 * 2. Multiple-choice (Selección múltiple)
 * 3. Drag-match (Arrastrar y soltar para vocabulario)
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // =======================================================
    // 1. Inicializar Juegos de Completar Espacios (Fill-in-the-Blank)
    // =======================================================
    function initializeFillInTheBlank() {
        document.querySelectorAll('.interactive-drill[data-game-type="fill-in-the-blank"]').forEach(container => {
            const blanks = container.querySelectorAll('.blank-word');
            
            // 1.1. Transformar <span> en <input>
            blanks.forEach(span => {
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'blank-input';
                // La respuesta correcta se almacena en el atributo data-correct-answer
                input.setAttribute('data-correct-answer', span.getAttribute('data-correct-answer').toLowerCase().trim());
                input.placeholder = 'Escribe aquí...';
                // Reemplazar el <span> por el <input>
                span.parentNode.replaceChild(input, span);
            });

            // 1.2. Lógica de Verificación
            const checkButton = container.querySelector('.check-button');
            const feedbackArea = container.querySelector('.feedback-area');

            checkButton.addEventListener('click', () => {
                let correctCount = 0;
                const inputs = container.querySelectorAll('.blank-input');
                
                inputs.forEach(input => {
                    const userAnswer = input.value.toLowerCase().trim();
                    const correctAnswer = input.getAttribute('data-correct-answer');

                    // Limpiar estilos previos
                    input.classList.remove('correct', 'incorrect');

                    if (userAnswer === correctAnswer) {
                        input.classList.add('correct');
                        correctCount++;
                    } else {
                        input.classList.add('incorrect');
                    }
                });

                // 1.3. Mostrar resultado final
                const total = inputs.length;
                let message = `<p>✅ Resultado: <span style="font-weight: bold;">${correctCount} de ${total}</span> correctas.`;
                
                if (correctCount === total) {
                    message += ' ¡Excelente trabajo! 🌟';
                } else {
                    message += ' Repasa la gramática e intenta de nuevo.';
                }

                feedbackArea.innerHTML = message;
            });
        });
    }

    // =======================================================
    // 2. Inicializar Juegos de Selección Múltiple (Multiple-Choice)
    // =======================================================
    function initializeMultipleChoice() {
        document.querySelectorAll('.interactive-drill[data-game-type="multiple-choice"]').forEach(container => {
            const questionContainer = container.querySelector('.question-container');
            const checkButton = container.querySelector('.check-button');
            const feedbackArea = container.querySelector('.feedback-area');
            const correctAnswer = questionContainer.getAttribute('data-correct-option'); // Ej: 'b'

            checkButton.addEventListener('click', () => {
                const selected = questionContainer.querySelector(`input[type="radio"]:checked`);

                // 2.1. Resetear estilos de todas las opciones
                questionContainer.querySelectorAll('label').forEach(label => {
                    label.style.backgroundColor = 'transparent';
                    label.style.fontWeight = 'normal';
                });

                if (!selected) {
                    feedbackArea.innerHTML = '<p style="color:#ff6f00;">Por favor, selecciona una opción antes de verificar.</p>';
                    return;
                }

                if (selected.value === correctAnswer) {
                    selected.closest('label').style.backgroundColor = '#d4edda'; // Verde suave
                    selected.closest('label').style.fontWeight = 'bold';
                    feedbackArea.innerHTML = '<p style="color:#28a745; font-weight: bold;">¡Correcto! 🥳</p>';
                } else {
                    selected.closest('label').style.backgroundColor = '#f8d7da'; // Rojo suave (Opción elegida)
                    
                    // Marcar la respuesta correcta (opcional, ayuda al alumno)
                    const correctLabel = questionContainer.querySelector(`input[value="${correctAnswer}"]`).closest('label');
                    if (correctLabel) {
                        correctLabel.style.backgroundColor = '#d4edda';
                        correctLabel.style.fontWeight = 'bold';
                    }
                    
                    feedbackArea.innerHTML = '<p style="color:#dc3545; font-weight: bold;">Incorrecto. La respuesta correcta está marcada en verde.</p>';
                }
            });
        });
    }
    
    // =======================================================
    // 3. Inicializar Drag and Drop (Arrastrar y Soltar)
    // * Simulación de coincidencia de palabras/imágenes
    // =======================================================
    function initializeDragAndDrop() {
        const dragContainer = document.getElementById('vocab-match-game');
        if (!dragContainer) return;

        const draggables = dragContainer.querySelectorAll('.draggable-word');
        const dropTargets = dragContainer.querySelectorAll('.drop-target');

        let matchesFound = 0;
        const totalTargets = dropTargets.length;

        // 3.1. Configurar Draggable
        draggables.forEach(word => {
            word.setAttribute('draggable', true);
            word.addEventListener('dragstart', (e) => {
                // Almacena el valor de la palabra (ej: 'Teacher') en el dataTransfer
                e.dataTransfer.setData('text/plain', e.target.getAttribute('data-word'));
                // Añade una clase para indicar que está siendo arrastrado (para CSS)
                setTimeout(() => e.target.classList.add('dragging'), 0);
            });
            word.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
            });
        });

        // 3.2. Configurar Drop Targets
        dropTargets.forEach(target => {
            target.addEventListener('dragover', (e) => {
                e.preventDefault(); // Permite soltar
                if (!target.classList.contains('correct')) { // Solo si no ha sido resuelto
                    target.classList.add('drag-over');
                }
            });

            target.addEventListener('dragleave', () => {
                target.classList.remove('drag-over');
            });

            target.addEventListener('drop', (e) => {
                e.preventDefault();
                target.classList.remove('drag-over');
                
                if (target.classList.contains('correct')) return;

                const draggedWord = e.dataTransfer.getData('text/plain');
                const targetJob = target.getAttribute('data-target');
                
                // Lógica de verificación
                if (draggedWord === targetJob) {
                    const draggedElement = dragContainer.querySelector(`.draggable-word[data-word="${draggedWord}"]`);
                    
                    // Aceptar y marcar como correcto
                    target.innerHTML = `<span style="color: #1a237e; font-size: 1.1em; font-weight: 700;">✅ ${draggedWord}</span>`;
                    target.classList.add('correct');
                    target.style.cursor = 'default';
                    
                    // Deshabilitar la palabra arrastrada
                    draggedElement.style.display = 'none';
                    
                    matchesFound++;
                    if (matchesFound === totalTargets) {
                        alert('¡Felicidades! Completaste todo el vocabulario. 🏆');
                    }

                } else {
                    // Feedback visual de error temporal
                    target.classList.add('incorrect');
                    setTimeout(() => target.classList.remove('incorrect'), 500);
                }
            });
        });
    }

    // --- Llamar a todas las funciones de inicialización ---
    initializeFillInTheBlank();
    initializeMultipleChoice();
    initializeDragAndDrop();
});