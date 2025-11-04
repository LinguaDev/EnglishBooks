document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.getElementById('navMenu');

    hamburger.addEventListener('click', function() {
        // Toggle (alternar) la clase 'active' para mostrar/ocultar el menú
        navMenu.classList.toggle('active');
        
        // Cambiar el ícono de hamburguesa a una "X" y viceversa
        if (navMenu.classList.contains('active')) {
            hamburger.innerHTML = '&#10005;'; // Símbolo de "X"
            hamburger.setAttribute('aria-expanded', 'true');
        } else {
            hamburger.innerHTML = '&#9776;'; // Símbolo de Hamburguesa
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });
});