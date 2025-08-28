let isAudioPlaying = false;
let activeAudios = [];
let patronCorrecto = ["tema", "audio","audio", "audio", "tema", "audio", "audio"];  // 🔹 el patrón esperado
let patronUsuario = [];
let isWelcomePlaying = false;
let welcomeAudio;
let video;
let yaMostroBotonComenzar = false;
let avatar;
let currentAudio = null; 
let habitacionActual = 'habitacion_1';
let seccionActual = 'seccion_1';
let imagenesPorCaja = {};
let subtitulosPorCaja = [];
let preguntasGrupoActual = [];
let preguntaActual = 0;
let gruposDePreguntas = {};
let estabaReproduciendo = false;
let animacionTextoID = null; 
let respuestasCorrectas = 0;
let botonesSecciones = [];
let bloqueActual = 0;
let yaComenzo = false;
let sectionCooldown = false;
let imageCooldown = false;
const botonesPorBloque = 4;
const sonidoAnimacion = document.getElementById("audio-animacion");
const HABITACION_6_CONFIG = {
    soloTexto: true,
    cancelarVideos: true,
    mostrarAvatar: true
};
function convertirAWebp(nombreImagen) {
  return nombreImagen.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');
}
function inicializarAvatarPorDefecto() {
    if (!window.avatarSeleccionado) {
        window.avatarSeleccionado = 'Andrea_anime';
        console.log('✅ Avatar inicializado por defecto:', window.avatarSeleccionado);
    }
}
cargarSeccionMinima()
const avatares = {
  Andrea: {
    nombre: "Andrea",
    imagen: "guias/aiko_irl.png",
    video: "guias/aiko_irl_gestos.mp4",
    audio: "bienvenida.mp3",
    saludo: "¡Hola! Soy Andrea, tu guía virtual. ¿Qué información deseas conocer?",
    vozID: "andrea_irl",
    videoBienvenida: "guias/aiko_irl_gestos.mp4"  // ✅ Añade esta línea
  },
  Andrea_anime: {
    nombre: "Andrea anime",
    imagen: "guias/aiko.jpeg",
    video: "guias/aiko_gestos.mp4",
    audio: "bienvenida.mp3",
    saludo: "¡Hola! Soy Andrea, tu guía virtual. ¿Qué información deseas conocer?",
    vozID: "andrea",
    videoBienvenida: "guias/aiko_gestos.mp4"  // ✅ Añade esta línea
  },
  Carlos_IRL: {
    nombre: "Carlos",
    imagen: "guias/carlos_irl.jpeg",
    video: "guias/carlos_irl_gestos.mp4",
    audio: "carlos.mp3",
    saludo: "¡Hola! Soy Carlos, tu guía virtual. ¿Qué información deseas conocer?",
    vozID: "carlos_irl",
    videoBienvenida: "guias/carlos_irl_gestos.mp4"  // ✅ Añade esta línea
  },
  Carlos: {
    nombre: "Carlos anime",
    imagen: "guias/carlos.jpg",
    video: "guias/carlos_gestos.mp4",
    audio: "carlos.mp3",
    saludo: "¡Hola! Soy Carlos, tu guía virtual. ¿Qué información deseas conocer?",
    vozID: "carlos",
    videoBienvenida: "guias/carlos_gestos.mp4"  // ✅ Añade esta línea
  },
  bryan: {
    nombre: "Bryan",
    imagen: "guias/bryan.jpeg",
    video: "guias/bryan.mp4",
    saludo: "¡Hola! Soy Bryan, tu guía virtual. ¿Qué información deseas conocer?",
    vozID: "Bryan",
    videoBienvenida: "guias/bryan.mp4"  // ✅ Añade esta línea
  },
  maria: {
    nombre: "Maria",
    imagen: "guias/maria.png",
    video: "guias/maria.mp4",
    audio: "Maria.mp3",
    saludo: "¡Hola! Soy Maria, tu guía virtual. ¿Qué información deseas conocer?",
    vozID: "Maria",
    videoBienvenida: "guias/maria.mp4"  // ✅ Añade esta línea
  }
};
let avatarSeleccionado = 'Andrea_anime';
const seccionesPorHabitacion = {
  habitacion_1: 16,
  habitacion_2: 18,
  habitacion_3: 9,
  habitacion_4: 20,
  habitacion_5: 3,
  habitacion_6: 1,
};

function registrarBoton(id) {
  patronUsuario.push(id);

  // Mantener el array del mismo tamaño que el patrón
  if (patronUsuario.length > patronCorrecto.length) {
    patronUsuario.shift();
  }

  if (JSON.stringify(patronUsuario) === JSON.stringify(patronCorrecto)) {
  const sorpresa = document.getElementById("sorpresa");
  sorpresa.classList.add("mostrar");
 }
}
document.getElementById("cerrar-sorpresa").addEventListener("click", () => {
document.getElementById("sorpresa").classList.remove("mostrar");
 // Conectar botones ya existentes
});
document.getElementById("btn-toggle-tema").addEventListener("click", () => registrarBoton("tema"));
document.getElementById("btn-toggle-sonido").addEventListener("click", () => registrarBoton("audio"));
function aplicarTemaPorHabitacion(habitacionID) {
  const body = document.body;
  // Elimina clases anteriores de tema
  body.classList.forEach(clase => {
    if (clase.startsWith("tema-habitacion_")) {
      body.classList.remove(clase);
    }
  });
  // Aplica clase nueva
  body.classList.add(`tema-${habitacionID}`);
}
function generarBotonesSecciones(habitacionID) {
  const contenedor = document.getElementById("galeria-controles");
  contenedor.innerHTML = "";
  botonesSecciones = [];

  const total = seccionesPorHabitacion[habitacionID] || 0;

  for (let i = 1; i <= total; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.onclick = () => cambiarSoloSeccion(`seccion_${i}`);
    botonesSecciones.push(btn);
  }

  actualizarBloque();
}
function detenerVideoBienvenida() {
  // Detener todos los videos de bienvenida
  document.querySelectorAll(".video-bienvenida").forEach(video => {
    video.pause();
    video.currentTime = 0;
    video.style.display = "none";
  });

  // Mostrar nuevamente todas las imágenes de avatar
  document.querySelectorAll(".avatar-option img").forEach(img => {
    img.style.display = "block";
  });
}

function moverBloque(direccion) {
  const totalBloques = Math.ceil(botonesSecciones.length / botonesPorBloque);
  bloqueActual = Math.min(Math.max(0, bloqueActual + direccion), totalBloques - 1);
  actualizarBloque();
}

function actualizarBloque() {
  const contenedor = document.getElementById("galeria-controles");
  contenedor.innerHTML = "";

  const inicio = bloqueActual * botonesPorBloque;
  const fin = inicio + botonesPorBloque;

  for (let i = inicio; i < fin && i < botonesSecciones.length; i++) {
    contenedor.appendChild(botonesSecciones[i]);
  }

  // Actualizar estado de las flechas
  document.getElementById("flecha-prev").disabled = bloqueActual === 0;
  document.getElementById("flecha-next").disabled = fin >= botonesSecciones.length;
}

function inicializarSelectorAvatares() {
  const contenedor = document.getElementById("avatar-options");
  contenedor.innerHTML = "";

  for (const id in avatares) {
    const datos = avatares[id];
    const div = document.createElement("div");
    div.classList.add("avatar-option");
    if (id === avatarSeleccionado) div.classList.add("selected");

    div.innerHTML = `
      <div class="avatar-media">
        <img src="${datos.imagen}" alt="${datos.nombre}">
        <video class="video-bienvenida"
               playsinline
               webkit-playsinline
               preload="auto"></video>
      </div>
      <div class="avatar-nombre">${datos.nombre}</div>
    `;

    div.onclick = () => {
      // ASEGURAR QUE SE ASIGNE CORRECTAMENTE ANTES QUE NADA
      window.avatarSeleccionado = id;
      avatarSeleccionado = id; // También variable global sin window
      
      console.log(`👤 Avatar cambiado a: ${id}`);
      console.log('🔍 Verificación window.avatarSeleccionado:', window.avatarSeleccionado);    

      // Verificar que existe
      if (!avatares[avatarSeleccionado]) {
          console.error(`❌ Avatar "${avatarSeleccionado}" no encontrado en avatares object`);
          return;
      }    

      // USAR EL SISTEMA OPTIMIZADO DESPUÉS de asignar
      if (window.changeGuide) {
          window.changeGuide(id);
      }

       // Resto del código de UI...
       document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove("selected"));
       div.classList.add("selected");    
     
       const datos = avatares[avatarSeleccionado]; // This should now work
       const video = div.querySelector(".video-bienvenida");
       const imagen = div.querySelector("img");
       const avatarImg = document.getElementById("avatar");

       if (avatarImg) {
           avatarImg.src = datos.imagen;
           avatarImg.classList.remove("hidden");
       }
      
      // Detener cualquier otro video en reproducción
      document.querySelectorAll(".video-bienvenida").forEach(v => {
        v.pause();
        v.currentTime = 0;
        v.style.display = "none";
      });
      document.querySelectorAll(".avatar-option img").forEach(img => {
        img.style.display = "block";
      });   

      if (datos.videoBienvenida && video) {
        video.src = datos.videoBienvenida;
        video.style.display = "block";
        imagen.style.display = "none";    

        video.play().then(() => {
          video.onended = () => {
            video.style.display = "none";
            imagen.style.display = "block";
          };
        }).catch(err => {
          console.warn("Error al reproducir video:", err);
          video.style.display = "none";
          imagen.style.display = "block";
        });
      }   

      // Mostrar saludo
      const dialogueBox = document.getElementById("dialogue-box");
      if (dialogueBox && datos.saludo) {
        escribirTextoGradualmente(datos.saludo, dialogueBox, 30);
      }
    };
    contenedor.appendChild(div);
  }
  const seleccionado = document.querySelector('.avatar-option.selected');
  if (seleccionado) {
    seleccionado.click();
  }
}

/*-------------------Juego----------------------------*/
    const audioCorrecto = new Audio("juego/sonido/qz-yes.mp3");
    const audioIncorrecto = new Audio("juego/sonido/qz-error.mp3");
    const sonidoFondo = new Audio("juego/sonido/qz-fondo.mp3");
    sonidoFondo.loop = true; // Para que se repita automáticamente
    sonidoFondo.volume = 1; // Volumen entre 0.0 (silencio) y 1.0 (máximo)

/*-------------------Juego----------------------------*/

function getRutaBase() {
  return `habitaciones/${habitacionActual}/${seccionActual}`;
}

window.addEventListener("DOMContentLoaded", () => {
  inicializarAvatarPorDefecto(); // ✅ NUEVA LÍNEA
  inicializarImagenes();
  inicializarSelectorAvatares();
});

document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("start-button");
  video = document.getElementById("aiko-video");
  avatar = document.getElementById("avatar");
  const welcomeScreen = document.getElementById("welcome-screen");
  const mainUI = document.getElementById("app");
 
  document.addEventListener("click", (e) => {
    const barra = document.getElementById("barra-navegacion");
    const toggleBtn = document.getElementById("toggle-navegacion"); 

    const hizoClickDentroDeBarra = barra.contains(e.target);
    const hizoClickEnBotonToggle = toggleBtn.contains(e.target);  

    if (!hizoClickDentroDeBarra && !hizoClickEnBotonToggle) {
      barra.classList.remove("visible");
    }
  });

  // 👇 CORRECTO: esto sí escucha el cambio de visibilidad
//  document.addEventListener("visibilitychange", () => {
//    if (document.visibilityState === "visible" && !yaMostroBotonComenzar) {
//      startButton.style.display = "inline-block";
//      yaMostroBotonComenzar = true;
//    }
//  });

  startButton.addEventListener("click", async () => {
    detenerVideoBienvenida()
    setTimeout(() => {
      yaComenzo = true;
    }, 1000); // ✅ 1 segundo de delay para evitar reproducción temprana
    // ✅ ahora sí comenzó oficialmente
    playClickSound();
    registrarBoton(avatares[avatarSeleccionado].nombre);
    document.getElementById("toggle-navegacion").disabled = false;

    btnAudio.classList.add("hidden");
    audio.pause()
    audioPlayer.classList.add("hidden");

    await cargarSeccionMinima();
    irAHabitacion('habitacion_1');
    welcomeScreen.classList.remove("blur-out");
    void welcomeScreen.offsetWidth;
    welcomeScreen.classList.add("blur-out");

    setTimeout(() => {
      mostrarLoaderInicial();

      setTimeout(() => {
        welcomeScreen.classList.add("hidden");
        ocultarLoaderInicial();
        mainUI.classList.remove("hidden");;

       const datos = avatares[avatarSeleccionado];
        avatar.classList.add("hidden");
        video.classList.remove("playing");      

    const primerBotonAudio = document.querySelector('.imagen-caja .btn-audio');
    if (primerBotonAudio) {
      reproducirAudio(primerBotonAudio);
    }

// En caso de que termine, mostrar el avatar
video.onended = () => {
  video.classList.remove("playing");
  avatar.classList.remove("hidden");
};

// Forzar carga del nuevo video
video.load();

    const dialogueBox = document.getElementById("dialogue-box");
    if (dialogueBox && datos.saludo) {
      escribirTextoGradualmente(datos.saludo, dialogueBox, 60);
    }

        aplicarAnimacionesEntrada();
      }, 800);
    }, 1000);
  });
});
function volverASeleccionDeGuia() {
  const welcomeScreen = document.getElementById("welcome-screen");
  const app = document.getElementById("app");
  const pantallaJuego = document.getElementById("pantalla-juego");

  // Oculta todo lo demás
  app.classList.add("hidden");
  pantallaJuego.classList.add("hidden");

  // Muestra la pantalla de bienvenida
  welcomeScreen.classList.remove("hidden");
  welcomeScreen.classList.remove("blur-out"); // por si hay efectos previos

  // Detiene al guía
  detenerGuia();
}

function detenerGuia() {
  const video = document.getElementById("aiko-video");
  const avatar = document.getElementById("avatar");
  const dialogueBox = document.getElementById("dialogue-box");

  if (video) {
    video.pause();                     // ⏹️ Detiene inmediatamente
    video.classList.remove("playing"); // 🛑 Detiene animación CSS
    // No se cambia el display, mantiene su lugar
  }

  if (avatar) {
    avatar.classList.remove("hidden"); // ✅ Muestra al avatar
  }
}

function moverControlesSeccion(direccion) {
  const contenedor = document.getElementById("galeria-controles");
  const ancho = 60; // ancho aproximado de un botón + margen

  contenedor.scrollBy({
    left: direccion * ancho * 2, // puedes cambiar 2 por 1 si quieres moverte de a uno
    behavior: "smooth"
  });
}

/* Animacion del loader COMIENZO */
function mostrarLoaderInicial() {
  let loader = document.getElementById('loader-inicial');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'loader-inicial';
    loader.innerHTML = `<div class="loader-spinner"></div>`;
    document.body.appendChild(loader);
  }
  loader.classList.remove('hidden');  
}
function ocultarLoaderInicial() {
  const loader = document.getElementById('loader-inicial');
  if (loader) {
    loader.classList.add('hidden');
  }
}
/* Loader 2*/
function mostrarLoaderHabitacion() {
  const loader = document.getElementById("habitacion-loader");
  if (loader) loader.classList.remove("hidden");
}

function ocultarLoaderHabitacion() {
  const loader = document.getElementById("habitacion-loader");
  if (loader) loader.classList.add("hidden");
}

/* animacion de entrada pantalla principal*/
function aplicarAnimacionesEntrada() {
  const elementosIzquierda = [
    document.getElementById("avatar-container"),
    document.getElementById("aiko-video"),
    document.getElementById("boton-imagen-container")
  ];
  
  const elementosDerecha = [
    document.getElementById("mapa-contenedor"),
    document.getElementById("galeria-slider")
  ];

  [...elementosIzquierda, ...elementosDerecha].forEach(el => {
    if (!el) return;

    el.classList.remove("slide-in-left", "slide-in-right");
    void el.offsetWidth; // Forzar reflow para reiniciar animación
  });

  elementosIzquierda.forEach(el => el?.classList.add("slide-in-left"));
  elementosDerecha.forEach(el => el?.classList.add("slide-in-right"));
}
/* Sonido para animacion zoom*/
function playAnimacionSound() {
  sonidoAnimacion.currentTime = 0;
  sonidoAnimacion.play();
}

/*Funcion maquina de escribir=====*/
function escribirTextoGradualmente(texto, elemento, velocidad = 60) {
  if (animacionTextoID) {
    clearTimeout(animacionTextoID);
    animacionTextoID = null;
  }

  let i = 0;
  elemento.textContent = "";

  function escribir() {
    if (i < texto.length) {
      elemento.textContent += texto.charAt(i);
      // ✅ Esta línea hace que el scroll se mueva al final
      elemento.scrollTop = elemento.scrollHeight;
      i++;
      animacionTextoID = setTimeout(escribir, velocidad);
    } else {
      animacionTextoID = null; // terminada
    }
  }
  escribir();
}


/*boton activo Visual========================*/
function marcarBotonActivo(seccionID) {
  const botones = document.querySelectorAll('#galeria-controles button');
  botones.forEach((btn) => {
    const texto = btn.textContent.trim();
    const seccionNumero = seccionID.split("_")[1];
    const activa = texto === seccionNumero;
    btn.classList.toggle("active", activa);
  });
}

function mostrarImagen(index) {
  const items = document.querySelectorAll(".item-galeria");
  items.forEach((item, i) => {
    const imagenContenedor = item.querySelector(".imagen-caja");
    const imagen = imagenContenedor.querySelector("img");
    const videoFrame = imagenContenedor.querySelector("iframe");

    if (i === index) {
      item.classList.add("active");

      // ✅ Si estamos en habitación 6, mostrar video YouTube
      if (habitacionActual === "habitacion_6") {
        // Si el iframe no existe, lo insertamos
        if (!videoFrame) {
          const iframe = document.createElement("iframe");
          iframe.width = "100%";
          iframe.height = "100%";
          iframe.src = "https://www.youtube.com/embed/2MOs4GGRIog?autoplay=1&mute=1"; // ✅ embed URL correcta
          iframe.frameBorder = "0";
          iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
          iframe.allowFullscreen = true;
          imagenContenedor.innerHTML = ""; // Limpiamos imagen anterior
          imagenContenedor.appendChild(iframe);
        }
      } else {
        // Para otras habitaciones, mostrar imagen normal
        imagen.style.display = "block";
      }
    } else {
      item.classList.remove("active");
    }
  });
}

// 1. Actualizar la función irAHabitacion para usar el sistema optimizado
async function irAHabitacion(habitacionID, seccionID) {
  mostrarLoaderHabitacion();
  
  // 🔥 USAR EL SISTEMA OPTIMIZADO - CORREGIDO
  if (window.navigateToRoom) {
    window.navigateToRoom(habitacionID);
  }
  
  bloqueActual = 0;
  const galeriaSlider = document.getElementById("galeria-slider");
  galeriaSlider.classList.remove("hidden");

  generarBotonesSecciones(habitacionID);

  habitacionActual = habitacionID;
  seccionActual = seccionID || seccionActual || 'seccion_1';

  aplicarTemaPorHabitacion(habitacionID);

  const rutaData = `habitaciones/${habitacionID}/${seccionActual}/data.json`;

  try {
    const data = await fetch(rutaData).then(r => r.json());

    imagenesPorCaja = data.imagenesPorCaja || {};
    subtitulosPorCaja = data.subtitulos || [];

    await cambiarSeccion(seccionActual);

    document.getElementById("imagen-superpuesta").classList.add("hidden");
  } catch (err) {
    console.error("Error al cargar habitación:", err);
    ocultarLoaderHabitacion();
  }

  // Actualiza botones activos visualmente
  document.querySelectorAll('.punto-mapa').forEach(p => {
    p.classList.toggle('activo', p.dataset.habitacion === habitacionID);
  });

  document.querySelectorAll('.mapa-btn').forEach(btn => {
    const accion = btn.getAttribute('onclick');
    btn.classList.toggle('activo', accion && accion.includes(habitacionID));
  });
}

async function cambiarSeccion(seccionID) {
  seccionActual = seccionID;
  
  if (window.navigateToSection) {
    window.navigateToSection(habitacionActual, seccionID);
  }
  
  const ruta = getRutaBase();

  fetch(`${ruta}/data.json`)
    .then(res => res.json())
    .then(data => {
      imagenesPorCaja = data.imagenesPorCaja || {};

      const galeriaSlider = document.getElementById("galeria-slider");
      galeriaSlider.innerHTML = "";

      Object.keys(imagenesPorCaja).forEach((key, i) => {
        const item = document.createElement("div");
        item.classList.add("item-galeria");
        if (i === 0) item.classList.add("active");
        item.dataset.index = i;

        item.innerHTML = `
          <div class="titulo-caja">${data.titulos?.[i] || `Obra ${i + 1}`}</div>
          <div class="subtitulo-caja">${data.subtitulos?.[i] || ""}</div>
          <div class="imagen-caja" data-index="${i}" data-step="0">
            <button class="btn-audio" onclick="reproducirAudio(this)" data-habitacion="${habitacionActual}" data-seccion="${seccionActual}" data-audio="video${i + 1}">⟲</button>
            <button class="btn-subimg" onclick="cambiarSubimagen(this)">▶</button>
            <button class="btn-retroceso" onclick="retrocederSubimagen(this)">◀</button>
            <img alt="Obra">
          </div>
        `;

        galeriaSlider.appendChild(item);

        // CAMBIO: Usar conversión a WebP
        const imagenElement = item.querySelector("img");
        if (imagenElement && imagenesPorCaja[key]?.[0]) {
          let imagenSrc = imagenesPorCaja[key][0];
          imagenSrc = convertirAWebp(imagenSrc);
          imagenElement.src = `${getRutaBase()}/${imagenSrc}`;
        }
      });

      subtitulosPorCaja = data.subtitulos || [];
      marcarBotonActivo(seccionID);
      inicializarImagenes();
      
      const botonAudio = document.querySelector('.imagen-caja .btn-audio');
      if (!isWelcomePlaying && yaComenzo && botonAudio) {
        setTimeout(() => {
          reproducirAudio(botonAudio);
        }, 500);
      }

      mostrarImagen(0);
    });
        
    await esperar(300);
    ocultarLoaderHabitacion();
}

function inicializarImagenes() {
  const ruta = getRutaBase();
  const contenedores = document.querySelectorAll('.imagen-caja');

  contenedores.forEach(contenedor => {
    const index = parseInt(contenedor.dataset.index);
    const img = contenedor.querySelector('img');
    const retro = contenedor.querySelector('.btn-retroceso');
    const avanzar = contenedor.querySelector('.btn-subimg');

    contenedor.dataset.step = 0;
    const lista = imagenesPorCaja[index] || [];
    
    // CAMBIO: Convertir a .webp
    let nombreImagen = lista[0].replace(/^.*\//, '');
    nombreImagen = convertirAWebp(nombreImagen);
    
    img.src = `${ruta}/imagenes/${nombreImagen}`;
    
    const subtituloCaja = contenedor.parentElement.querySelector('.subtitulo-caja');
    const subtitulo = subtitulosPorCaja[index]?.[0] || "";
    if (subtituloCaja) subtituloCaja.textContent = subtitulo;
    if (retro) retro.style.display = "none";
    if (avanzar && lista.length <= 1) avanzar.style.display = "none";
  });
}
function cambiarSoloSeccion(seccionID) {
  if (sectionCooldown) return; // Bloquear si hay cooldown
  
  sectionCooldown = true;
  
  const botones = document.querySelectorAll("#galeria-controles button");
  botones.forEach(btn => btn.classList.remove("active"));

  const index = parseInt(seccionID.split("_")[1]);
  botones[index - 1]?.classList.add("active");

  seccionActual = seccionID;
  cambiarSeccion(seccionID);
  
  botonesSecciones.forEach(btn => {
    btn.classList.remove("active");
  });
  
  // Liberar cooldown después de 800ms
  setTimeout(() => {
    sectionCooldown = false;
  }, 500);
}
function stopWelcomePlayback() {
  if (!isWelcomePlaying) return;

  isWelcomePlaying = false;

  if (video) {
    video.pause();
    video.classList.remove("playing");
    video.currentTime = 0;
  }

  if (avatar) {
    avatar.classList.remove("hidden");
  }
}

/* Reproducir click = playClickSound(); ========*/
function playClickSound() {
  const clickSound = document.getElementById("click-sound");
  if (clickSound) {
    clickSound.currentTime = 0;
    clickSound.play();
  }
}

function cambiarSubimagen(button) {
  if (imageCooldown) return; // Bloquear si hay cooldown
  
  imageCooldown = true;
  
  const contenedor = button.closest('.imagen-caja');
  const index = parseInt(contenedor.dataset.index);
  let step = parseInt(contenedor.dataset.step);
  const lista = imagenesPorCaja[index];

  // Verificar si hay mÃ¡s imÃ¡genes
  if (step >= lista.length - 1) {
    imageCooldown = false; // Liberar si no hay mÃ¡s imÃ¡genes
    return;
  }

  // Deshabilitar temporalmente
  const retro = contenedor.querySelector('.btn-retroceso');
  const avanzar = contenedor.querySelector('.btn-subimg');
  retro.disabled = true;
  avanzar.disabled = true;

  playClickSound();

  // Incrementar paso
  step++;
  contenedor.dataset.step = step;

  // Actualizar botÃ³n de audio con nueva informaciÃ³n
  const botonAudio = contenedor.querySelector('.btn-audio');
  if (botonAudio) {
    botonAudio.dataset.habitacion = habitacionActual;
    botonAudio.dataset.seccion = seccionActual;
    botonAudio.dataset.audio = `video${index + 1}${step > 0 ? `_sub${step}` : ''}`;
  }

  // Crear overlay de carga
  const overlay = document.createElement("div");
  overlay.className = "loader-overlay";
  const spinner = document.createElement("div");
  spinner.className = "loader-spinner";
  overlay.appendChild(spinner);
  contenedor.appendChild(overlay);

  // Cambiar imagen
  const img = contenedor.querySelector('img');
  img.classList.add("slide-out-left");
  
  // Convertir a WebP
  let nombreImagen = lista[step].replace(/^.*\//, '');
  nombreImagen = convertirAWebp(nombreImagen);
  
  const nuevaRuta = `${getRutaBase()}/imagenes/${nombreImagen}`;

  // FunciÃ³n de limpieza mejorada
  const cleanup = () => {
    if (overlay && overlay.parentNode) {
      contenedor.removeChild(overlay);
    }
    retro.disabled = false;
    avanzar.disabled = false;
    
    // Liberar cooldown despuÃ©s de 600ms
    setTimeout(() => {
      imageCooldown = false;
    }, 1500);
  };

  // Cargar nueva imagen
  const tempImg = new Image();
  tempImg.onload = () => {
    img.src = tempImg.src;
    cleanup();
    
    // Actualizar subtÃ­tulo
    const subtituloCaja = contenedor.parentElement.querySelector('.subtitulo-caja');
    const subtitulo = subtitulosPorCaja[index]?.[step] || "";
    if (subtituloCaja) subtituloCaja.textContent = subtitulo;

    // Animaciones
    img.classList.remove("slide-out-left");
    img.classList.add("slide-in-right");
    setTimeout(() => img.classList.remove("slide-in-right"), 400);

    // Actualizar visibilidad de botones
    retro.style.display = step > 0 ? "block" : "none";
    avanzar.style.display = step >= lista.length - 1 ? "none" : "block";
    
    // REPRODUCIR AUDIO INMEDIATAMENTE
    if (botonAudio && window.reproducirAudio) {
      window.reproducirAudio(botonAudio);
    }
  };

  tempImg.onerror = () => {
    console.error(`Error cargando imagen: ${nuevaRuta}`);
    cleanup();
    
    // REPRODUCIR AUDIO AUNQUE FALLE LA IMAGEN
    if (botonAudio && window.reproducirAudio) {
      setTimeout(() => window.reproducirAudio(botonAudio), 200);
    }
  };

  // Iniciar carga
  tempImg.src = nuevaRuta;
}

// Modificar la funciÃ³n retrocederSubimagen existente
function retrocederSubimagen(button) {
  if (imageCooldown) return; // Bloquear si hay cooldown
  
  imageCooldown = true;
  
  const contenedor = button.closest('.imagen-caja');
  const index = parseInt(contenedor.dataset.index);
  let step = parseInt(contenedor.dataset.step);
  const lista = imagenesPorCaja[index];

  // Verificar si se puede retroceder
  if (step <= 0) {
    imageCooldown = false; // Liberar si no se puede retroceder
    return;
  }

  // Deshabilitar temporalmente
  const retro = contenedor.querySelector('.btn-retroceso');
  const avanzar = contenedor.querySelector('.btn-subimg');
  retro.disabled = true;
  avanzar.disabled = true;

  playClickSound();

  // Decrementar paso
  step--;
  contenedor.dataset.step = step;

  // Actualizar botÃ³n de audio
  const botonAudio = contenedor.querySelector('.btn-audio');
  if (botonAudio) {
    botonAudio.dataset.habitacion = habitacionActual;
    botonAudio.dataset.seccion = seccionActual;
    botonAudio.dataset.audio = `video${index + 1}${step > 0 ? `_sub${step}` : ''}`;
  }

  // Crear overlay
  const overlay = document.createElement("div");
  overlay.className = "loader-overlay";
  const spinner = document.createElement("div");
  spinner.className = "loader-spinner";
  overlay.appendChild(spinner);
  contenedor.appendChild(overlay);

  // Cambiar imagen
  const img = contenedor.querySelector('img');
  img.classList.add("slide-out-right");
  
  let nombreImagen = lista[step].replace(/^.*\//, '');
  nombreImagen = convertirAWebp(nombreImagen);
  
  const nuevaRuta = `${getRutaBase()}/imagenes/${nombreImagen}`;

  // FunciÃ³n de limpieza mejorada
  const cleanup = () => {
    if (overlay && overlay.parentNode) {
      contenedor.removeChild(overlay);
    }
    retro.disabled = false;
    avanzar.disabled = false;
    
    // Liberar cooldown despuÃ©s de 600ms
    setTimeout(() => {
      imageCooldown = false;
    }, 1500);
  };

  // Cargar imagen
  const tempImg = new Image();
  tempImg.onload = () => {
    img.src = tempImg.src;
    cleanup();
    
    // Actualizar subtÃ­tulo
    const subtituloCaja = contenedor.parentElement.querySelector('.subtitulo-caja');
    const subtitulo = subtitulosPorCaja[index]?.[step] || "";
    if (subtituloCaja) subtituloCaja.textContent = subtitulo;

    // Animaciones
    img.classList.remove("slide-out-right");
    img.classList.add("slide-in-left");
    setTimeout(() => img.classList.remove("slide-in-left"), 400);

    // Actualizar botones
    retro.style.display = step > 0 ? "block" : "none";
    avanzar.style.display = step >= lista.length - 1 ? "none" : "block";

    // REPRODUCIR AUDIO INMEDIATAMENTE
    if (botonAudio && window.reproducirAudio) {
      window.reproducirAudio(botonAudio);
    }
  };

  tempImg.onerror = () => {
    console.error(`Error cargando imagen: ${nuevaRuta}`);
    cleanup();
    
    // REPRODUCIR AUDIO AUNQUE FALLE LA IMAGEN
    if (botonAudio && window.reproducirAudio) {
      setTimeout(() => window.reproducirAudio(botonAudio), 200);
    }
  };

  tempImg.src = nuevaRuta;
}

/* AUDIO Y IMAGENES DE CAJA FINNNN   ==========*/

function mostrarImagenSuperpuesta() {
  const boton = document.activeElement;

  if (boton && boton.classList.contains("btn-imagen")) {
    boton.classList.add("hidden");
    setTimeout(() => boton.classList.remove("hidden"), 300);
  }

  playClickSound();
  document.getElementById("imagen-superpuesta").classList.remove("hidden");
  document.getElementById("galeria-slider").classList.add("hidden");
}

function cerrarImagenSuperpuesta() {
  document.getElementById("imagen-superpuesta").classList.add("hidden");
  document.getElementById("galeria-slider").classList.remove("hidden");
  playClickSound();
}

function esperarRecursosIniciales(timeoutMs = 2000) {
  return new Promise(resolve => {
    let isResolved = false;

    // Respaldo: después de timeout forzamos continuar
    const timeout = setTimeout(() => {
      if (!isResolved) {
        console.warn("⏳ Continuando sin terminar de cargar todos los recursos...");
        isResolved = true;
        resolve();
      }
    }, timeoutMs);

    const avatar = document.getElementById("avatar");
    const video = document.getElementById("aiko-video");

    // Esperar a que la galería esté en el DOM
    const esperarGaleria = new Promise(galeriaRes => {
      const esperar = () => {
        const img = document.querySelector('.imagen-caja img');
        if (img && img.complete) return galeriaRes(img);
        if (img) {
          img.onload = () => galeriaRes(img);
        } else {
          setTimeout(esperar, 100); // esperar hasta que exista
        }
      };
      esperar();
    });

    Promise.all([
      new Promise(res => video.readyState >= 3 ? res() : video.oncanplay = res),
      esperarGaleria
    ]).then(() => {
      if (!isResolved) {
        clearTimeout(timeout);
        isResolved = true;
        resolve();
      }
    });
  });
}
async function cargarSeccionMinima() {
  habitacionActual = 'habitacion_1';
  seccionActual = 'seccion_1';

  const ruta = getRutaBase();

  const res = await fetch(`${ruta}/data.json`);
  const data = await res.json();

  imagenesPorCaja = data.imagenesPorCaja || {};
  subtitulosPorCaja = data.subtitulos || [];

  const galeriaSlider = document.getElementById("galeria-slider");
  galeriaSlider.innerHTML = "";
  marcarBotonActivo('seccion_1');

  const key = Object.keys(imagenesPorCaja)[0];
  const lista = imagenesPorCaja[key];

  const item = document.createElement("div");
  item.classList.add("item-galeria", "active");
  item.dataset.index = 0;

  item.innerHTML = `
    <div class="titulo-caja">${data.titulos?.[0] || `Obra 1`}</div>
    <div class="subtitulo-caja">${data.subtitulos?.[0]?.[0] || ""}</div>
    <div class="imagen-caja" data-index="0" data-step="0">
      <button class="btn-audio" onclick="reproducirAudio(this)">⟲</button>
      <button class="btn-subimg" onclick="cambiarSubimagen(this)">▶</button>
      <button class="btn-retroceso" onclick="retrocederSubimagen(this)">◀</button>
      <img alt="Obra">
    </div>
  `;

  galeriaSlider.appendChild(item);

  const contenedor = item.querySelector('.imagen-caja');
  const img = contenedor.querySelector('img');
  const step = 0;
  
  // CAMBIO: Convertir a WebP
  let nombreImagen = lista[step].replace(/^.*\//, '');
  nombreImagen = convertirAWebp(nombreImagen);
  img.src = `${ruta}/imagenes/${nombreImagen}`;

  await new Promise((resolve) => {
    if (img.complete) {
      resolve();
    } else {
      img.onload = () => resolve();
      img.onerror = () => {
        console.warn("⚠ No se pudo cargar la imagen inicial");
        resolve();
      };
    }
  });
}

/*-------------------Juego----------------------------*/
function iniciarJuego() {
  detenerGuia();
  document.getElementById("imagen-superpuesta").classList.add("hidden");
  document.getElementById("pantalla-juego").classList.remove("hidden");
  document.getElementById("introduccion-juego").classList.remove("hidden");
  document.getElementById("juego-container").classList.add("hidden");
  document.getElementById("fondo-opciones").classList.remove("hidden");
  playClickSound();
}

async function iniciarJuegoReal() {
  const overlay = document.getElementById("pantalla-transicion");
  playClickSound();
  // Mostrar fundido a negro
  overlay.style.opacity = "1";

  // Esperar a que el fundido esté completamente negro (0.4s)
  await new Promise(resolve => setTimeout(resolve, 400));

  // ⏲️ Ya estando en negro, hacemos el cambio de contenido:
  document.getElementById("introduccion-juego").classList.add("hidden");
  document.getElementById("juego-container").classList.remove("hidden");

  stopWelcomePlayback();
  playClickSound();
  document.getElementById("pantalla-final").classList.add("hidden");

  document.getElementById("juego-imagen").classList.remove("hidden");
  document.getElementById("juego-pregunta").classList.remove("hidden");
  document.getElementById("juego-opciones").classList.remove("hidden");

  // Cargar preguntas
  const response = await fetch("juego/preguntas.json");
  gruposDePreguntas = await response.json();
  const nombresGrupos = Object.keys(gruposDePreguntas);
  const grupoAleatorio = nombresGrupos[Math.floor(Math.random() * nombresGrupos.length)];
  iniciarGrupo(grupoAleatorio);

  sonidoFondo.currentTime = 0;
  sonidoFondo.play();

  // Quitar fundido a negro suavemente
  setTimeout(() => {
    overlay.style.opacity = "0";
  }, 100); // ✅ Empieza a desvanecer después de haber cambiado todo
}

function cerrarJuegoYVolverImagen() {
  document.getElementById("pantalla-juego").classList.add("hidden");
  document.getElementById("imagen-superpuesta").classList.remove("hidden");
  playClickSound();
  // Ocultar pantalla final por si estaba visible
  document.getElementById("btn-retroceder").classList.remove("hidden");
  document.getElementById("pantalla-final").classList.add("hidden");

  // Restaurar elementos de juego
  document.getElementById("juego-imagen").classList.remove("hidden");
  document.getElementById("juego-pregunta").classList.remove("hidden");
  document.getElementById("juego-opciones").classList.remove("hidden");

  // Detener sonido de fondo
  sonidoFondo.pause();
  sonidoFondo.currentTime = 0;
}
function cargarPregunta() {
  const p = preguntasGrupoActual[preguntaActual % preguntasGrupoActual.length];

  const juegoImagen = document.getElementById("juego-imagen");
  const juegoPregunta = document.getElementById("juego-pregunta");
  const opcionesDiv = document.getElementById("juego-opciones");
  const feedback = document.getElementById("juego-feedback");

  // Reset y ocultar
  juegoPregunta.style.opacity = "0";
  opcionesDiv.innerHTML = "";
  feedback.textContent = "";

  // Quitar animaciones previas
  juegoImagen.classList.remove("scale-up-center", "scale-down-center");
  juegoPregunta.classList.remove("scale-up-center");

  // Agregar animación de salida
  juegoImagen.classList.add("scale-down-center");

  // Esperar a que termine la animación de salida (400ms aprox)
  setTimeout(() => {
    // Ocultar imagen visualmente mientras cambia
    juegoImagen.style.opacity = "0";

    // Cambiar imagen
    juegoImagen.src = `juego/imagenes/${p.imagen}`;

    // Cuando la imagen nueva haya cargado:
    juegoImagen.onload = () => {
      // Mostrar con animación de entrada
      juegoImagen.classList.remove("scale-down-center");
      juegoImagen.classList.add("scale-up-center");
      juegoImagen.style.opacity = "1";

      // Mostrar pregunta con pequeña demora
        juegoPregunta.textContent = p.pregunta;
        juegoPregunta.classList.add("scale-up-center");
        juegoPregunta.style.opacity = "1";
    };

    // Crear botones de opciones
    p.opciones.forEach((opcion, i) => {
  setTimeout(() => {
    const btn = document.createElement("button");
    btn.textContent = opcion;
    btn.className = "opcion-boton";
    setTimeout(() => {
        playAnimacionSound();
      }, i * 10); 
    // Respuesta inmediata, sin delay perceptible
    btn.onclick = () => {
      verificarRespuesta(i, p.correcta);
    };

    opcionesDiv.appendChild(btn);
  }, i *300); // escalonado visual (0.15s entre botones)
});

  }, 400); // ⏳ tiempo para que la animación de salida se vea
}

function verificarRespuesta(seleccionada, correcta) {
  const feedback = document.getElementById("juego-feedback");
  const botones = document.querySelectorAll("#juego-opciones button");

  botones.forEach((btn, index) => {
    btn.disabled = true;
    
    // Marcar correcto
    const esCorrecto = seleccionada === correcta && index === correcta;
    const esIncorrecto = index === seleccionada && index !== correcta;
    
    if (esCorrecto || esIncorrecto) {
      const claseBase = esCorrecto ? "correcta" : "incorrecta";
      const animacion = esCorrecto ? "zoom-success" : "vibrar";
    
      // Reinicia cualquier animación previa
      btn.classList.remove(claseBase, animacion);
    
      requestAnimationFrame(() => {
        btn.classList.add(claseBase, animacion);
      });
    
      btn.addEventListener("animationend", () => {
        btn.classList.remove(animacion);
      }, { once: true });
    }
  });
  
  // Feedback visual y sonido
  if (seleccionada === correcta) {
    respuestasCorrectas++;
    feedback.style.color = "green";
    audioCorrecto.currentTime = 0;
    audioCorrecto.play();
  } else {
    feedback.style.color = "red";
    audioIncorrecto.currentTime = 0;
    audioIncorrecto.play();
  }

  setTimeout(() => {
    siguientePregunta();
  }, 1500); // espera 2 segundos
}


function siguientePregunta() {
  preguntaActual++;
  if (preguntaActual >= preguntasGrupoActual.length) {
    mostrarPantallaFinal();
  } else {
    cargarPregunta();
  }
}

function mostrarPantallaFinal() {
  mostrarImagenFinal(respuestasCorrectas);

  const mensajeFinal = document.getElementById("mensaje-final");

  if (respuestasCorrectas <= 2) {
    mensajeFinal.textContent = "❗Sigue intentando";
    mensajeFinal.style.color = "crimson";
  } else if (respuestasCorrectas <= 5) {
    mensajeFinal.textContent = "Buen intento 💡";
    mensajeFinal.style.color = "#eca304"; // amarillo
  } else {
    mensajeFinal.textContent = "🎉¡Felicidades!🎉";
    mensajeFinal.style.color = "#2ecc71"; // verde
  }
 const mensajeExtra = document.getElementById("mensaje-extra");
  mensajeExtra.innerHTML = `Terminaste el QUIZ ✅<br><strong>Respuestas correctas: ${respuestasCorrectas} de ${preguntasGrupoActual.length}</strong>`;
  document.getElementById("juego-imagen").classList.add("hidden");
  document.getElementById("fondo-opciones").classList.add("hidden");
  document.getElementById("juego-pregunta").classList.add("hidden");
  document.getElementById("juego-opciones").classList.add("hidden");
  document.getElementById("btn-retroceder").classList.add("hidden");
  document.getElementById("pantalla-final").classList.remove("hidden"); /*"quiz-navegacion"  */
  // Limpia feedback en caso de que quedara visible
  document.getElementById("juego-feedback").textContent = "";
}
function cambiarGrupo() {
  const nombresGrupos = Object.keys(gruposDePreguntas);
  const grupoAleatorio = nombresGrupos[Math.floor(Math.random() * nombresGrupos.length)];
  iniciarGrupo(grupoAleatorio);
  playClickSound();
  // Mostrar todo de nuevo
  document.getElementById("btn-retroceder").classList.remove("hidden");
  document.getElementById("fondo-opciones").classList.remove("hidden");
  document.getElementById("juego-imagen").classList.remove("hidden");
  document.getElementById("juego-pregunta").classList.remove("hidden");
  document.getElementById("juego-opciones").classList.remove("hidden");
  document.getElementById("pantalla-final").classList.add("hidden");
}
function iniciarGrupo(nombreGrupo) {
  preguntasGrupoActual = gruposDePreguntas[nombreGrupo];
  preguntaActual = 0;
  respuestasCorrectas = 0;
  cargarPregunta();
}
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // La pestaña se oculta
    if (!sonidoFondo.paused) {
      estabaReproduciendo = true;
      sonidoFondo.pause();
    } else {
      estabaReproduciendo = false;
    }
  } else {
    // La pestaña vuelve a estar visible
    if (estabaReproduciendo) {
      sonidoFondo.play();
    }
  }
});
function mostrarImagenFinal(respuestasCorrectas) {
  const imagenFinal = document.getElementById("imagen-final-resultado");

  let opciones = [];

  if (respuestasCorrectas <= 2) {
    opciones = ["bajo1.webp", "bajo2.webp"];
  } else if (respuestasCorrectas <= 5) {
    opciones = ["medio1.webp", "medio2.webp", "medio3.webp"];
  } else {
    opciones = ["alto1.webp", "alto2.webp"];
  }

  // Elegir aleatoria
  const imagenElegida = opciones[Math.floor(Math.random() * opciones.length)];

  // Asignar ruta
  imagenFinal.src = `juego/imagen-final/${imagenElegida}`;
}
/*-------------------Juego----------------------------*/
function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
window.addEventListener("load", () => {
    if (!window.avatarSeleccionado) {
        inicializarAvatarPorDefecto();
    }
});
window.onload = function () {
  google.accounts.id.initialize({
    client_id: "339878496574-apf0924ekjaf03ibf9f3713o5abs29o5.apps.googleusercontent.com",
    callback: handleCredentialResponse
  });

  google.accounts.id.renderButton(
    document.getElementById("google-login"),
    { theme: "outline", size: "large" }
  );
};

function handleCredentialResponse(response) {
  const data = parseJwt(response.credential);

  // Oculta botón de login y muestra nombre
  document.getElementById("google-login").style.display = "none";
  const userInfo = document.getElementById("user-info");
  userInfo.textContent = `Hola, ${data.name}`;
  userInfo.style.color = "white";

  // Obtener fecha y hora local
  const fechaActual = new Date().toLocaleString();  // Ej: "20/5/2025, 14:30:12"

  // Enviar datos a Google Sheets
  fetch("https://sheetdb.io/api/v1/z4nqkbu7f5eer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      data: {
        name: data.name,
        email: data.email,
        picture: data.picture,
        fecha: fechaActual
      }
    })
  })
  .then(res => res.json())
  .then(resData => console.log("Guardado en Google Sheets:", resData))
  .catch(err => console.error("Error al guardar:", err));
}

// Función para decodificar el token JWT
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join('')
  );

  return JSON.parse(jsonPayload);
}

/*function registrarBoton(botonNombre) {
  const fechaHora = new Date().toLocaleString();

  // Primero, buscar si ya existe ese botón
  fetch(`https://sheetdb.io/api/v1/pyex2a4luszrz/search?boton=${encodeURIComponent(botonNombre)}`)
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        // Ya existe: actualizamos el conteo (+1)
        const idFila = data[0].id || data[0]._id;  // depende de si SheetDB devuelve id explícito

        const nuevoConteo = parseInt(data[0].conteo || 0) + 1;

        fetch(`https://sheetdb.io/api/v1/pyex2a4luszrz/boton/${encodeURIComponent(botonNombre)}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            data: {
              conteo: nuevoConteo,
              fecha: fechaHora
            }
          })
        })
        .then(res => res.json())
        .then(() => console.log(`Conteo actualizado para ${botonNombre}`))
        .catch(err => console.error("Error al actualizar:", err));
      } else {
        // No existe: crear nuevo
        fetch("https://sheetdb.io/api/v1/pyex2a4luszrz", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            data: {
              boton: botonNombre,
              fecha: fechaHora,
              conteo: 1
            }
          })
        })
        .then(res => res.json())
        .then(() => console.log(`Nuevo botón registrado: ${botonNombre}`))
        .catch(err => console.error("Error al registrar nuevo botón:", err));
      }
    })
    .catch(err => console.error("Error al buscar botón:", err));
}*/
/* BOTONES DEL MENU - PIE DE PAGINA ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const btnGuia = document.getElementById("btn-cambiar-guia");
  const btnPrincipal = document.getElementById("btn-volver-principal");
  const btnQuiz = document.getElementById("btn-ir-quiz");
  
  btnGuia?.addEventListener("click", () => {
    document.getElementById("app")?.classList.add("hidden");
    document.getElementById("pantalla-juego")?.classList.add("hidden");
    yaComenzo = false;
    detenerVideoBienvenida()
    volverASeleccionDeGuia();
    cerrarImagenSuperpuesta?.();
    cerrarJuegoYVolverImagen?.();
    detenerGuia?.();
    btnAudio.classList.remove("hidden");
  });

  btnPrincipal?.addEventListener("click", () => {
    document.getElementById("welcome-screen")?.classList.add("hidden");
    document.getElementById("app")?.classList.remove("hidden");
    yaComenzo = true;
    cerrarJuegoYVolverImagen?.();        // Oculta el quiz
    cerrarImagenSuperpuesta?.();         // Oculta el mapa
    detenerVideoBienvenida()
    btnAudio.classList.add("hidden");
    audio.pause()
    audioPlayer.classList.add("hidden");
  });

  btnQuiz?.addEventListener("click", () => {
    yaComenzo = true;
    document.getElementById("welcome-screen")?.classList.add("hidden");
    document.getElementById("app")?.classList.remove("hidden");
    iniciarJuego?.();
    detenerGuia();
    detenerVideoBienvenida()
    btnAudio.classList.add("hidden");
    audio.pause()
    audioPlayer.classList.add("hidden");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggle-navegacion");
  const barra = document.getElementById("barra-navegacion");

  toggleBtn?.addEventListener("click", () => {
    barra?.classList.toggle("visible");
  });
});
/*BOTONES DE CONFIGURACION - ENCABEZADO ==================================*/
// Botón de configuración (⚙️)
const configPanel = document.getElementById("config-panel");
const btnConfiguracion = document.getElementById("btn-configuracion");

// Mostrar/ocultar con clase animada
btnConfiguracion.addEventListener("click", () => {
  configPanel.classList.toggle("visible");
});

// Cerrar el panel si haces clic fuera de él
document.addEventListener("click", (e) => {
  const clickDentro =
    configPanel.contains(e.target) || btnConfiguracion.contains(e.target);
  if (!clickDentro) {
    configPanel.classList.remove("visible");
  }
});

// 🌗 Tema claro/oscuro
const btnTema = document.getElementById("btn-toggle-tema");
btnTema.addEventListener("click", () => {
  const claro = document.body.classList.toggle("modo-claro");
  btnTema.textContent = claro ? "☀️" : "🌙";
  btnTema.title = claro ? "Modo oscuro" : "Modo claro";
});

// 🔇 Silenciar todo
const btnSonido = document.getElementById("btn-toggle-sonido");

btnSonido.addEventListener("click", () => {
  const silenciado = btnSonido.textContent === "🔊";
  btnSonido.textContent = silenciado ? "🔇" : "🔊";
  btnSonido.title = silenciado ? "Sonido activado" : "Silenciado";

  // Silenciar todos los elementos <audio> y <video> del DOM
  const mediosDOM = document.querySelectorAll("audio, video");
  mediosDOM.forEach(m => m.muted = silenciado);

  // Silenciar los audios creados por JS
  if (sonidoFondo) sonidoFondo.muted = silenciado;
  if (audioCorrecto) audioCorrecto.muted = silenciado;
  if (audioIncorrecto) audioIncorrecto.muted = silenciado;

  // También puedes pausar el fondo si se desea
  if (silenciado && !sonidoFondo.paused) sonidoFondo.pause();
});

const btnAudio = document.getElementById("btn-audio");
const audioPlayer = document.getElementById("audio-player");
const audio = document.getElementById("audio");
const progress = document.getElementById("audio-progress");

const iconOn = document.getElementById("icon-audio-on");
const iconOff = document.getElementById("icon-audio-off");

btnAudio.addEventListener("click", () => {
  const isHidden = audioPlayer.classList.toggle("hidden");

  if (!isHidden) {
    audio.play();
    iconOn.classList.remove("hidden");
    iconOff.classList.add("hidden");
  } else {
    audio.pause();
    iconOn.classList.add("hidden");
    iconOff.classList.remove("hidden");
  }
});

audio.addEventListener("timeupdate", () => {
  progress.max = audio.duration;
  progress.value = audio.currentTime;
});

progress.addEventListener("input", () => {
  audio.currentTime = progress.value;
});

/*Full-S*/
function activarPantallaCompleta() {
  const elem = document.documentElement;

  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { 
    elem.webkitRequestFullscreen(); // Safari
  } else if (elem.msRequestFullscreen) { 
    elem.msRequestFullscreen(); // IE11
  }

  // Cambiar botones
  document.getElementById("btn-fullscreen").classList.add("hidden");
  document.getElementById("btn-exit-fullscreen").classList.remove("hidden");
}

function salirPantallaCompleta() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }

  // Cambiar botones
  document.getElementById("btn-exit-fullscreen").classList.add("hidden");
  document.getElementById("btn-fullscreen").classList.remove("hidden");
}// PARCHE ESPECÍFICO PARA HABITACIÓN 6 - Añadir al final de script.js

// Modificar la función irAHabitacion para detectar habitación 6
const irAHabitacionOriginal = window.irAHabitacion;
window.irAHabitacion = async function(habitacionID, seccionID) {
  // Si es habitación 6, detener video y mostrar avatar
  if (habitacionID === 'habitacion_6') {
    const video = document.getElementById("aiko-video");
    const avatar = document.getElementById("avatar");
    
    if (video) {
      video.pause();
      video.classList.remove("playing");
    }
    
    if (avatar) {
      avatar.classList.remove("hidden");
    }
  }
  
  // Ejecutar función original
  return await irAHabitacionOriginal.call(this, habitacionID, seccionID);
};

// Modificar reproducirAudio para habitación 6
const reproducirAudioOriginal = window.reproducirAudio;
window.reproducirAudio = async function(button) {
  const currentRoom = button?.dataset?.habitacion || window.habitacionActual || 'habitacion_1';
  
  // Si estamos en habitación 6, solo cargar texto y mostrar avatar
  if (currentRoom === 'habitacion_6') {
    if (button?.disabled) return;
    
    button.disabled = true;
    setTimeout(() => button.disabled = false, 800);
    
    if (typeof playClickSound === 'function') {
      playClickSound();
    }
    
    // Asegurar que el avatar esté visible y video pausado
    const avatar = document.getElementById("avatar");
    const video = document.getElementById("aiko-video");
    const loader = document.getElementById("avatar-loader");
    
    if (video) {
      video.pause();
      video.classList.remove("playing");
    }
    
    if (avatar) {
      avatar.classList.remove("hidden");
    }
    
    if (loader) {
      loader.classList.add("hidden");
    }
    
    // Solo cargar texto para habitación 6
    await loadSubtitlesHabitacion6(currentRoom);
    return;
  }
  
  // Para otras habitaciones, usar función original
  return await reproducirAudioOriginal.call(this, button);
};

// Función específica para cargar texto de habitación 6
async function loadSubtitlesHabitacion6(roomId) {
  try {
    // Intentar cargar el único archivo de texto de habitación 6
    const textoURL = `habitaciones/${roomId}/seccion_1/textos/video1.txt`;
    
    console.log(`Cargando texto de habitación 6: ${textoURL}`);
    
    const response = await fetch(textoURL);
    let texto = "";
    
    if (response.ok) {
      texto = await response.text();
      console.log("✅ Texto cargado correctamente para habitación 6");
    } else {
      console.warn("⚠️ No se pudo cargar el archivo de texto");
      texto = "Información no disponible para esta sección.";
    }
    
    const dialogueBox = document.getElementById("dialogue-box");
    if (dialogueBox && typeof escribirTextoGradualmente === 'function') {
      escribirTextoGradualmente(texto, dialogueBox, 60);
    }
    
  } catch (error) {
    console.warn("❌ Error cargando texto para habitación 6:", error);
    
    const dialogueBox = document.getElementById("dialogue-box");
    if (dialogueBox && typeof escribirTextoGradualmente === 'function') {
      escribirTextoGradualmente("Error al cargar la información.", dialogueBox, 60);
    }
  }
}

// Modificar la función cambiarSeccion para habitación 6
const cambiarSeccionOriginal = window.cambiarSeccion;
window.cambiarSeccion = async function(seccionID) {
  const currentRoom = window.habitacionActual;
  
  // Si estamos en habitación 6, configurar específicamente
  if (currentRoom === 'habitacion_6') {
    window.seccionActual = seccionID;
    
    // Detener video y mostrar avatar
    const video = document.getElementById("aiko-video");
    const avatar = document.getElementById("avatar");
    
    if (video) {
      video.pause();
      video.classList.remove("playing");
    }
    
    if (avatar) {
      avatar.classList.remove("hidden");
    }
    
    // Auto-reproducir texto al cambiar sección en habitación 6
    setTimeout(() => {
      const botonAudio = document.querySelector('.imagen-caja .btn-audio');
      if (botonAudio) {
        window.reproducirAudio(botonAudio);
      }
    }, 500);
    
    return;
  }
  
  // Para otras habitaciones, usar función original
  return await cambiarSeccionOriginal.call(this, seccionID);
};

console.log("🏠 Parche para habitación 6 aplicado - Solo texto y avatar");
// Variable global para controlar la reproducción actual
let currentVideoRequest = null;
let videoQueue = [];

// Función mejorada de reproducción con control de secuencia
async function reproducirAudioSecuencial(button) {
    if (button.disabled) return;
    
    button.disabled = true;
    setTimeout(() => button.disabled = false, 800);

    if (typeof playClickSound === 'function') {
        playClickSound();
    }

    const contenedor = button.closest('.imagen-caja');
    if (!contenedor) return;

    const index = parseInt(contenedor.dataset.index) || 0;
    const step = parseInt(contenedor.dataset.step) || 0;
    const audioName = `video${index + 1}${step > 0 ? `_sub${step}` : ''}.mp4`;

    let currentRoom = button.dataset.habitacion || window.habitacionActual || 'habitacion_1';
    let currentSection = button.dataset.seccion || window.seccionActual || 'seccion_1';

    // Crear ID único para esta petición
    const requestId = `${currentRoom}_${currentSection}_${audioName}_${Date.now()}`;
    
    console.log(`🎬 Nueva petición de video: ${requestId}`);

    // CANCELAR petición anterior si existe
    if (currentVideoRequest) {
        console.log(`❌ Cancelando petición anterior: ${currentVideoRequest}`);
        currentVideoRequest = null;
    }

    // Establecer como petición actual
    currentVideoRequest = requestId;

    const loader = document.getElementById("avatar-loader");
    const avatar = document.getElementById("avatar");
    const video = document.getElementById("aiko-video");

    // UI: Mostrar loading
    if (avatar) avatar.classList.add("hidden");
    if (video) video.classList.remove("playing");
    if (loader) loader.classList.remove("hidden");

    try {
        // Verificar si esta petición sigue siendo válida
        if (currentVideoRequest !== requestId) {
            console.log(`⏭️ Petición cancelada durante setup: ${requestId}`);
            return;
        }

        // Para habitación 6, solo mostrar avatar y texto
        if (currentRoom === 'habitacion_6') {
            if (video) {
                video.pause();
                video.classList.remove("playing");
            }
            if (avatar) avatar.classList.remove("hidden");
            if (loader) loader.classList.add("hidden");
            
            await loadSubtitles(currentRoom, currentSection, audioName);
            return;
        }

        // Obtener video con verificación de cancelación
        const blobURL = await getVideoWithCancellation(currentRoom, currentSection, audioName, requestId);

        // Verificar si la petición sigue siendo válida después de la carga
        if (currentVideoRequest !== requestId) {
            console.log(`⏭️ Petición cancelada después de carga: ${requestId}`);
            return;
        }

        if (blobURL && video) {
            console.log(`✅ Reproduciendo video: ${audioName}`);
            
            // Configurar video solo si la petición sigue activa
            if (video.src !== blobURL) {
                video.src = blobURL;
                video.load();
            }
            
            video.currentTime = 0;

            // Reproducir con verificación de cancelación
            await playVideoWithCancellation(video, requestId);

            // Configurar finalización solo si no fue cancelado
            if (currentVideoRequest === requestId) {
                video.onended = () => {
                    video.classList.remove("playing");
                    if (avatar) avatar.classList.remove("hidden");
                    if (currentVideoRequest === requestId) {
                        currentVideoRequest = null;
                    }
                };
            }

        } else {
            throw new Error(`Video no disponible: ${audioName}`);
        }

    } catch (error) {
        // Solo mostrar error si la petición no fue cancelada
        if (currentVideoRequest === requestId) {
            console.warn(`⚠️ Error reproduciendo ${audioName}:`, error);
            showAvatarOnly();
        }
    }

    // Cargar subtítulos solo si la petición sigue activa
    if (currentVideoRequest === requestId) {
        await loadSubtitles(currentRoom, currentSection, audioName);
    }
}

// Función para obtener video con verificación de cancelación
async function getVideoWithCancellation(roomId, sectionId, videoName, requestId) {
    const checkCancellation = () => {
        if (currentVideoRequest !== requestId) {
            throw new Error('Petición cancelada');
        }
    };

    checkCancellation();
    
    if (window.videoPreloader || window.enhancedPreloader) {
        const preloader = window.enhancedPreloader || window.videoPreloader;
        const blobURL = await preloader.getVideo(roomId, sectionId, videoName);
        
        checkCancellation();
        return blobURL;
    }

    return null;
}

// Función para reproducir video con verificación de cancelación
async function playVideoWithCancellation(video, requestId) {
    return new Promise((resolve, reject) => {
        let resolved = false;
        
        const checkAndResolve = (result) => {
            if (resolved) return;
            if (currentVideoRequest !== requestId) {
                resolved = true;
                reject(new Error('Petición cancelada'));
                return;
            }
            resolved = true;
            resolve(result);
        };

        const checkAndReject = (error) => {
            if (resolved) return;
            resolved = true;
            reject(error);
        };

        const cleanup = () => {
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('error', handleError);
        };

        const handleCanPlay = () => {
            if (currentVideoRequest !== requestId) {
                cleanup();
                checkAndReject(new Error('Petición cancelada'));
                return;
            }

            const loader = document.getElementById("avatar-loader");
            if (loader) loader.classList.add("hidden");
            video.classList.add("playing");
            
            video.play()
                .then(() => checkAndResolve())
                .catch(err => checkAndReject(err));
        };

        const handleError = (error) => {
            cleanup();
            checkAndReject(error);
        };

        video.addEventListener('canplay', handleCanPlay, { once: true });
        video.addEventListener('error', handleError, { once: true });

        // Timeout con verificación de cancelación
        setTimeout(() => {
            if (!resolved) {
                cleanup();
                checkAndReject(new Error('Video timeout'));
            }
        }, 2000);
    });
}

function showAvatarOnly() {
    const loader = document.getElementById("avatar-loader");
    const avatar = document.getElementById("avatar");
    const video = document.getElementById("aiko-video");
    
    if (loader) loader.classList.add("hidden");
    if (avatar) avatar.classList.remove("hidden");
    if (video) {
        video.classList.remove("playing");
        video.pause();
    }
}
// AÑADIR ESTAS OPTIMIZACIONES AL FINAL DE script.js

// 1. CONTROL DE COOLDOWNS MÁS AGRESIVO
let globalCooldown = false;

// 2. OPTIMIZAR cambiarSubimagen para evitar cargas innecesarias
const cambiarSubImagenOriginal = window.cambiarSubimagen;
window.cambiarSubimagen = function(button) {
    if (globalCooldown) return;
    
    globalCooldown = true;
    setTimeout(() => globalCooldown = false, 1000);
    
    return cambiarSubImagenOriginal.call(this, button);
};

// 3. OPTIMIZAR retrocederSubimagen
const retrocederSubImagenOriginal = window.retrocederSubimagen;
window.retrocederSubimagen = function(button) {
    if (globalCooldown) return;
    
    globalCooldown = true;
    setTimeout(() => globalCooldown = false, 1000);
    
    return retrocederSubImagenOriginal.call(this, button);
};

// 4. MEJORAR irAHabitacion para cancelar cargas previas
const irAHabitacionOptimizado = window.irAHabitacion;
window.irAHabitacion = async function(habitacionID, seccionID) {
    // Cancelar cargas anteriores
    if (window.videoManager) {
        window.videoManager.cancelAllNonPriority();
    }
    
    return await irAHabitacionOptimizado.call(this, habitacionID, seccionID);
};

// 5. OPTIMIZAR cambiarSeccion
const cambiarSeccionOptimizado = window.cambiarSeccion;
window.cambiarSeccion = async function(seccionID) {
    if (globalCooldown) return;
    
    globalCooldown = true;
    setTimeout(() => globalCooldown = false, 800);
    
    return await cambiarSeccionOptimizado.call(this, seccionID);
};

// 6. LIMPIAR CACHE AUTOMÁTICAMENTE
setInterval(() => {
    if (window.videoManager) {
        const stats = window.videoManager.getStats();
        if (stats.videosInCache > 10) { // Si hay más de 10 videos en cache
            console.log('🧹 Limpieza automática de cache iniciada');
            // Limpiar videos antiguos (implementación simplificada)
            const cacheSize = stats.videosInCache;
            if (cacheSize > 15) {
                window.videoManager.clearCaches();
            }
        }
    }
}, 60000); // Cada minuto

console.log('⚡ Optimizaciones adicionales de script.js aplicadas');

// CONTROLADOR DE DESCARGAS ÚNICAS - Evita duplicados
class VideoDownloadController {
    constructor() {
        this.downloadPromises = new Map(); // Promesas de descarga en curso
        this.completedDownloads = new Map(); // Descargas completadas
        this.maxConcurrentDownloads = 2; // Máximo 2 descargas simultáneas
        this.currentDownloads = 0;
        this.downloadQueue = []; // Cola de espera
    }

    // MÉTODO PRINCIPAL: Obtener video con control de duplicados
    async getVideoSingle(roomId, sectionId, videoName) {
        const videoKey = this.generateKey(roomId, sectionId, videoName);
        
        // 1. Si ya está completado, devolver inmediatamente
        if (this.completedDownloads.has(videoKey)) {
            console.log(`✅ Video desde cache: ${videoName}`);
            return this.completedDownloads.get(videoKey);
        }

        // 2. Si ya está descargándose, esperar a esa promesa
        if (this.downloadPromises.has(videoKey)) {
            console.log(`⏳ Esperando descarga en curso: ${videoName}`);
            return await this.downloadPromises.get(videoKey);
        }

        // 3. Iniciar nueva descarga controlada
        const downloadPromise = this.executeDownload(roomId, sectionId, videoName, videoKey);
        this.downloadPromises.set(videoKey, downloadPromise);

        try {
            const result = await downloadPromise;
            
            // Mover a completados
            this.completedDownloads.set(videoKey, result);
            this.downloadPromises.delete(videoKey);
            
            return result;
        } catch (error) {
            // Limpiar en caso de error
            this.downloadPromises.delete(videoKey);
            throw error;
        }
    }

    // EJECUTAR DESCARGA CON CONTROL DE CONCURRENCIA
    async executeDownload(roomId, sectionId, videoName, videoKey) {
        // Control de concurrencia
        if (this.currentDownloads >= this.maxConcurrentDownloads) {
            console.log(`🚦 Cola de descarga: ${videoName}`);
            await this.waitInQueue(videoKey);
        }

        this.currentDownloads++;
        console.log(`⬇️ Iniciando descarga: ${videoName} (${this.currentDownloads}/${this.maxConcurrentDownloads})`);

        try {
            const result = await this.downloadVideo(roomId, sectionId, videoName);
            return result;
        } finally {
            this.currentDownloads--;
            this.processQueue(); // Procesar siguiente en cola
        }
    }

    // DESCARGA REAL DEL VIDEO
    async downloadVideo(roomId, sectionId, videoName) {
        const guide = this.getCurrentGuide();
        const videoURL = `habitaciones/${roomId}/${sectionId}/videos/${guide}/${videoName}`;
        
        // Verificar existencia primero
        const headResponse = await fetch(videoURL, { method: 'HEAD', cache: 'no-cache' });
        if (!headResponse.ok) {
            console.warn(`❌ Video no existe: ${videoName}`);
            return null;
        }

        // Descargar blob
        const response = await fetch(videoURL);
        if (!response.ok) throw new Error(`Error ${response.status}`);

        const blob = await response.blob();
        const blobURL = URL.createObjectURL(blob);
        
        console.log(`✅ Video descargado: ${videoName} (${(blob.size / 1024 / 1024).toFixed(2)} MB)`);
        return blobURL;
    }

    // SISTEMA DE COLA
    waitInQueue(videoKey) {
        return new Promise(resolve => {
            this.downloadQueue.push({ videoKey, resolve });
        });
    }

    processQueue() {
        if (this.downloadQueue.length > 0 && this.currentDownloads < this.maxConcurrentDownloads) {
            const { resolve } = this.downloadQueue.shift();
            resolve();
        }
    }

    // UTILIDADES
    generateKey(roomId, sectionId, videoName) {
        const guide = this.getCurrentGuide();
        const key = `${roomId}/${sectionId}/${guide}/${videoName}`;
        console.log(`🔑 Clave generada: ${key}`);
        return key;
    }

// FUNCIÓN getCurrentGuide() CORREGIDA
getCurrentGuide() {
    console.log('🎭 Avatar seleccionado:', window.avatarSeleccionado);
    
    // Buscar avatarSeleccionado en diferentes ubicaciones
    let selectedAvatar = window.avatarSeleccionado || 
                        window.avatar?.seleccionado || 
                        avatarSeleccionado;

    // Si no se encuentra, buscar en el DOM
    if (!selectedAvatar) {
        const selectedElement = document.querySelector('.avatar-option.selected');
        if (selectedElement) {
            const avatarData = selectedElement.querySelector('.avatar-nombre')?.textContent;
            if (avatarData) {
                const nameToId = {
                    'Andrea': 'Andrea',
                    'Andrea anime': 'Andrea_anime',
                    'Carlos': 'Carlos_IRL',
                    'Carlos anime': 'Carlos',
                    'Bryan': 'bryan',
                    'Maria': 'maria'
                };
                selectedAvatar = nameToId[avatarData] || 'Andrea_anime';
            }
        }
    }

    console.log('🔍 Avatar detectado:', selectedAvatar);
    
    // 🔧 VERIFICACIÓN MEJORADA - Usar tanto window.avatares como la variable global
    const avataresObj = window.avatares || avatares;
    
    if (selectedAvatar && avataresObj) {
        console.log('📋 Avatares disponibles:', Object.keys(avataresObj));
        console.log('🔍 Buscando avatar:', selectedAvatar);
        console.log('✅ Existe?', !!avataresObj[selectedAvatar]);
        
        // 🔧 MAPEO DIRECTO SIN VERIFICAR EXISTENCIA EN AVATARES
        const guideMapping = {
            'Andrea': 'andrea_irl',        
            'Andrea_anime': 'andrea',      
            'Carlos_IRL': 'carlos_irl',    // ← Carlos real
            'Carlos': 'carlos',            // ← Carlos anime
            'bryan': 'Bryan',              
            'maria': 'Maria'               
        };
        
        const mappedGuide = guideMapping[selectedAvatar];
        
        if (mappedGuide) {
            console.log(`📁 Carpeta de videos: ${mappedGuide}`);
            return mappedGuide;
        } else {
            console.warn(`⚠️ No hay mapeo para "${selectedAvatar}", usando andrea por defecto`);
            return 'andrea';
        }
        
    } else {
        console.warn('⚠️ No se encontró objeto avatares o selectedAvatar');
        console.log('🔍 selectedAvatar:', selectedAvatar);
        console.log('🔍 avataresObj:', !!avataresObj);
    }
    
    console.warn('⚠️ Usando andrea por defecto');
    return 'andrea';
}

    // LIMPIAR CACHE
    clearCache() {
        // Revocar blob URLs
        this.completedDownloads.forEach(blobURL => {
            if (blobURL) URL.revokeObjectURL(blobURL);
        });
        
        this.completedDownloads.clear();
        this.downloadPromises.clear();
        this.downloadQueue = [];
    }

    // ESTADÍSTICAS
    getStats() {
        return {
            completed: this.completedDownloads.size,
            downloading: this.downloadPromises.size,
            queued: this.downloadQueue.length,
            concurrent: this.currentDownloads
        };
    }
}

// PRELOADER OPTIMIZADO CON CONTROL DE DUPLICADOS
class OptimizedVideoPreloader {
    constructor() {
        this.downloadController = new VideoDownloadController();
        this.isEnabled = true;
    }

    // MÉTODO PRINCIPAL QUE REEMPLAZA TODOS LOS ANTERIORES
    async getVideo(roomId, sectionId, videoName) {
        if (!this.isEnabled) return null;
        
        return await this.downloadController.getVideoSingle(roomId, sectionId, videoName);
    }

    // PRECARGA INTELIGENTE SIN DUPLICADOS
    async preloadSection(roomId, sectionId) {
        if (!this.isEnabled) return;
        
        console.log(`🚀 Precarga optimizada: ${roomId}/${sectionId}`);
        
        // Lista de videos posibles para esta sección
        const possibleVideos = [
            'video1.mp4',
            'video1_sub1.mp4',
            'video1_sub2.mp4',
            'video1_sub3.mp4'
        ];

        // Precargar en secuencia controlada
        for (const videoName of possibleVideos) {
            try {
                const result = await this.getVideo(roomId, sectionId, videoName);
                if (!result) break; // Si no existe, parar
            } catch (error) {
                console.warn(`Falló precarga de ${videoName}:`, error);
                break;
            }
            
            // Pausa entre precargas
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }

    // CAMBIAR GUÍA
    changeGuide(newGuide) {
        console.log(`👤 Cambiando guía, limpiando cache...`);
        this.downloadController.clearCache();
    }

    // ESTADÍSTICAS
    getStats() {
        return this.downloadController.getStats();
    }
}

// FUNCIÓN DE REPRODUCCIÓN OPTIMIZADA
async function reproducirVideoOptimizado(button) {
    if (button?.disabled) return;
    
    // Deshabilitar temporalmente
    if (button) {
        button.disabled = true;
        setTimeout(() => button.disabled = false, 1000);
    }

    // Sonido de click
    if (typeof playClickSound === 'function') {
        playClickSound();
    }

    const contenedor = button?.closest('.imagen-caja');
    if (!contenedor) return;

    const index = parseInt(contenedor.dataset.index) || 0;
    const step = parseInt(contenedor.dataset.step) || 0;
    const audioName = `video${index + 1}${step > 0 ? `_sub${step}` : ''}.mp4`;

    const currentRoom = button?.dataset?.habitacion || window.habitacionActual || 'habitacion_1';
    const currentSection = button?.dataset?.seccion || window.seccionActual || 'seccion_1';

    console.log(`🎬 Reproduciendo: ${audioName} en ${currentRoom}/${currentSection}`);

    // UI: Mostrar loading
    const loader = document.getElementById("avatar-loader");
    const avatar = document.getElementById("avatar");
    const video = document.getElementById("aiko-video");

    if (avatar) avatar.classList.add("hidden");
    if (video) video.classList.remove("playing");
    if (loader) loader.classList.remove("hidden");

    try {
        // Obtener video SIN DUPLICADOS
        const blobURL = await optimizedPreloader.getVideo(currentRoom, currentSection, audioName);

        if (blobURL && video) {
            console.log(`▶️ Configurando video: ${audioName}`);
            
            // Solo cambiar src si es diferente
            if (video.src !== blobURL) {
                video.src = blobURL;
                video.load();
            }
            
            video.currentTime = 0;

            // Reproducir con timeout
            await new Promise((resolve, reject) => {
                let resolved = false;
                
                const cleanup = () => {
                    video.removeEventListener('canplay', onCanPlay);
                    video.removeEventListener('error', onError);
                };

                const onCanPlay = () => {
                    if (resolved) return;
                    resolved = true;
                    cleanup();
                    
                    // Ocultar loader y mostrar video
                    if (loader) loader.classList.add("hidden");
                    video.classList.add("playing");
                    
                    video.play().then(resolve).catch(reject);
                };

                const onError = (error) => {
                    if (resolved) return;
                    resolved = true;
                    cleanup();
                    reject(error);
                };

                video.addEventListener('canplay', onCanPlay, { once: true });
                video.addEventListener('error', onError, { once: true });

                // Timeout de 3 segundos
                setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        cleanup();
                        reject(new Error('Video timeout'));
                    }
                }, 3000);
            });

            // Configurar evento de finalización
            video.onended = () => {
                video.classList.remove("playing");
                if (avatar) avatar.classList.remove("hidden");
            };

        } else {
            throw new Error(`Video no disponible: ${audioName}`);
        }

    } catch (error) {
        console.warn(`⚠️ Error reproduciendo ${audioName}:`, error);
        
        // Mostrar solo avatar
        if (loader) loader.classList.add("hidden");
        if (avatar) avatar.classList.remove("hidden");
        if (video) video.classList.remove("playing");
    }

    // Cargar subtítulos
    await loadSubtitles(currentRoom, currentSection, audioName);
}

// CARGAR SUBTÍTULOS
async function loadSubtitles(roomId, sectionId, audioName) {
    try {
        const textURL = `habitaciones/${roomId}/${sectionId}/textos/${audioName.replace('.mp4', '.txt')}`;
        const response = await fetch(textURL);
        const texto = response.ok ? await response.text() : "";
        
        const dialogueBox = document.getElementById("dialogue-box");
        if (dialogueBox && typeof escribirTextoGradualmente === 'function') {
            escribirTextoGradualmente(texto || "Información no disponible", dialogueBox, 60);
        }
    } catch (error) {
        console.warn(`No se pudo cargar texto para: ${audioName}`);
    }
}

// INSTANCIA GLOBAL
const optimizedPreloader = new OptimizedVideoPreloader();

// REEMPLAZAR FUNCIÓN GLOBAL
window.reproducirAudio = reproducirVideoOptimizado;
window.optimizedVideoPreloader = optimizedPreloader;

// NAVEGACIÓN OPTIMIZADA
window.navigateToSection = function(roomId, sectionId) {
    // Precarga con delay para evitar sobrecargar
    setTimeout(() => {
        optimizedPreloader.preloadSection(roomId, sectionId);
    }, 1000);
};

window.changeGuide = function(guideName) {
    optimizedPreloader.changeGuide(guideName);
};

// COMANDOS DE DEBUG
window.showOptimizedStats = function() {
    console.log('📊 Stats optimizadas:', optimizedPreloader.getStats());
};

window.clearVideoCache = function() {
    optimizedPreloader.downloadController.clearCache();
    console.log('🧹 Cache limpiado');
};

console.log('⚡ Controlador de descargas únicas inicializado - Sin duplicados');
