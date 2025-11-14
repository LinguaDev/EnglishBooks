// =============================================================
// Archivo: app.js
// Lógica de Autenticación y Manejo de Datos (Firebase Firestore)
// =============================================================

// NOTA: Las variables 'auth' y 'db' se asumen inicializadas en index.html
// por el bloque de código que contiene tu 'firebaseConfig'.

// Estado del usuario
let currentUser = null; 

// ------------------------------------------------------------
// 1. FUNCIONES DE AUTENTICACIÓN
// ------------------------------------------------------------

// Escucha los cambios en el estado de autenticación (si el usuario ha iniciado o cerrado sesión)
auth.onAuthStateChanged((user) => {
    if (user) {
        // Usuario logueado
        currentUser = user;
        console.log("Usuario logueado:", user.email);
        document.getElementById('auth-message').textContent = `Bienvenido, ${user.email} (${user.uid.substring(0, 8)}...)`;
        showAppScreen();
        loadProgress(user.uid); // Cargar datos al iniciar sesión
    } else {
        // Usuario no logueado
        currentUser = null;
        console.log("Usuario no logueado. Mostrando pantalla de login.");
        document.getElementById('auth-message').textContent = "Por favor, inicia sesión o regístrate.";
        showAuthScreen();
    }
});

// Función para registrar un nuevo usuario
function register(email, password) {
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log("✅ Registro exitoso. Iniciando sesión.");
            // Opcional: Crear un documento inicial en Firestore para el nuevo usuario
            const userId = userCredential.user.uid;
            db.collection("progress").doc(userId).set({
                // Datos iniciales para un nuevo estudiante
                last_update: firebase.firestore.FieldValue.serverTimestamp(),
                book_1: {
                    last_unit: 1,
                    last_exercise: 0,
                    score_total: 0
                }
            });
        })
        .catch((error) => {
            console.error("❌ Error de Registro:", error.message);
            alert("Error de Registro: " + error.message);
        });
}

// Función para iniciar sesión
function login(email, password) {
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            console.log("✅ Inicio de sesión exitoso.");
        })
        .catch((error) => {
            console.error("❌ Error de Login:", error.message);
            alert("Error de Login: " + error.message);
        });
}

// Función para cerrar sesión
function logout() {
    auth.signOut()
        .then(() => {
            console.log("👋 Sesión cerrada.");
        })
        .catch((error) => {
            console.error("❌ Error al cerrar sesión:", error.message);
        });
}

// ------------------------------------------------------------
// 2. FUNCIONES DE MANEJO DE DATOS (PROGRESO)
// ------------------------------------------------------------

// Carga el progreso del usuario actual desde Firestore
function loadProgress(userId) {
    db.collection("progress").doc(userId).get()
        .then((doc) => {
            if (doc.exists) {
                const data = doc.data();
                document.getElementById('progress-output').textContent = 
                    JSON.stringify(data.book_1, null, 2);
                console.log("Datos de progreso cargados:", data);
            } else {
                document.getElementById('progress-output').textContent = 
                    "No hay progreso guardado todavía. ¡Empieza a estudiar!";
            }
        })
        .catch((error) => {
            console.error("❌ Error al cargar progreso:", error);
        });
}

// Guarda un nuevo avance en la base de datos
function saveProgress(unit, exercise) {
    if (!currentUser) {
        alert("Debes iniciar sesión para guardar tu progreso.");
        return;
    }

    const userId = currentUser.uid;

    // Usamos .update() para modificar campos específicos sin borrar el resto
    db.collection("progress").doc(userId).update({
        last_update: firebase.firestore.FieldValue.serverTimestamp(),
        // Actualiza el progreso en el Libro 1
        "book_1.last_unit": unit,
        "book_1.last_exercise": exercise,
        // (Podrías añadir la puntuación del ejercicio aquí también)
    })
    .then(() => {
        alert(`✅ Progreso guardado: Unidad ${unit}, Ejercicio ${exercise}.`);
        loadProgress(userId); // Recarga para mostrar el cambio
    })
    .catch((error) => {
        console.error("❌ Error al guardar progreso:", error);
        alert("Error al guardar: " + error.message);
    });
}

// ------------------------------------------------------------
// 3. FUNCIONES DE INTERFAZ DE USUARIO (MOCK)
// ------------------------------------------------------------

function showAuthScreen() {
    document.getElementById('auth-form').style.display = 'block';
    document.getElementById('app-content').style.display = 'none';
}

function showAppScreen() {
    document.getElementById('auth-form').style.display = 'none';
    document.getElementById('app-content').style.display = 'block';
}

// Vincula las funciones a los botones y eventos cuando el HTML esté cargado
window.onload = function() {
    // --- Manejo del formulario de Login/Registro ---
    document.getElementById('submit-auth').addEventListener('click', () => {
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        const action = document.getElementById('auth-action').value;

        if (!email || !password) {
            alert("Por favor, introduce email y contraseña.");
            return;
        }

        if (action === 'login') {
            login(email, password);
        } else {
            register(email, password);
        }
    });

    // --- Manejo del formulario de Progreso ---
    document.getElementById('save-progress-btn').addEventListener('click', () => {
        const unit = parseInt(document.getElementById('unit-input').value);
        const exercise = parseInt(document.getElementById('exercise-input').value);
        if (unit > 0 && exercise >= 0) {
            saveProgress(unit, exercise);
        } else {
            alert("Valores de unidad o ejercicio inválidos.");
        }
    });

    // --- Botón de Logout ---
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Inicializa la vista por defecto
    showAuthScreen(); 
}