let isAudioPlaying = false;
let activeAudios = [];
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
const botonesPorBloque = 4;
const sonidoAnimacion = document.getElementById("audio-animacion");
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
      avatarSeleccionado = id;    

      // Desmarcar anteriores y marcar este
      document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove("selected"));
      div.classList.add("selected");    

      const datos = avatares[avatarSeleccionado];
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

    let ID = avatares[avatarSeleccionado]?.vozID || avatarID;
    changeGuide(ID);
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


/* llama a cambiar habitacion */
async function irAHabitacion(habitacionID, seccionID) {
  mostrarLoaderHabitacion();

  bloqueActual = 0;
  const galeriaSlider = document.getElementById("galeria-slider");
  galeriaSlider.classList.remove("hidden");

  generarBotonesSecciones(habitacionID);

  habitacionActual = habitacionID;

  // ✅ Corrige esto: usa seccionID si viene, si no deja la actual o por defecto
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
  navigateToRoom(habitacionID);
}

/* cambiar entre habitaciones ===========================*/
async function cambiarSeccion(seccionID) {
  seccionActual = seccionID;
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
            <button
              class="btn-audio"
              onclick="reproducirAudio(this)"
              data-habitacion="${habitacionActual}"
              data-seccion="${seccionActual}"
              data-audio="video${i + 1}"
            >⟲</button>
            <button class="btn-subimg" onclick="cambiarSubimagen(this)">▶</button>
            <button class="btn-retroceso" onclick="retrocederSubimagen(this)">◀</button>
            <img alt="Obra">
          </div>
        `;

        galeriaSlider.appendChild(item);

        // Cargar imagen
        const imagenElement = item.querySelector("img");
        if (imagenElement && imagenesPorCaja[key]?.[0]) {
          const imagenSrc = `${getRutaBase()}/${imagenesPorCaja[key][0]}`;
          imagenElement.src = imagenSrc;
        }
      });

      subtitulosPorCaja = data.subtitulos || [];
      marcarBotonActivo(seccionID);
      inicializarImagenes();
      // Pre-cargar primera imagen antes de mostrarla
      const primeraURL = imagenesPorCaja[0]?.[0];
      const botonAudio = document.querySelector('.imagen-caja .btn-audio');
      if (!isWelcomePlaying && yaComenzo && botonAudio) {
        reproducirAudio(botonAudio); // Paralelo
      }

      mostrarImagen(0); // Mostrar inmediatamente (la imagen se cargará en segundo plano)

      if (!isWelcomePlaying && yaComenzo && botonAudio) {
        reproducirAudio(botonAudio); // Reproducir sin esperar a la imagen
      }

      })
        
        await esperar(300);
        ocultarLoaderHabitacion(); // Por si falla

        navigateToSection(habitacionActual, seccionID);
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
    img.src = `${ruta}/imagenes/${lista[0].replace(/^.*\//, '')}`; // elimina el "seccion_x/" interno si viene
    const subtituloCaja = contenedor.parentElement.querySelector('.subtitulo-caja');
    const subtitulo = subtitulosPorCaja[index]?.[0] || "";
    if (subtituloCaja) subtituloCaja.textContent = subtitulo;
    if (retro) retro.style.display = "none";
    if (avanzar && lista.length <= 1) avanzar.style.display = "none";
  });
}
function cambiarSoloSeccion(seccionID) {
  const botones = document.querySelectorAll("#galeria-controles button");
  botones.forEach(btn => btn.classList.remove("active"));

  const index = parseInt(seccionID.split("_")[1]);
  botones[index - 1]?.classList.add("active");

  seccionActual = seccionID;
  cambiarSeccion(seccionID);
   botonesSecciones.forEach(btn => {
    btn.classList.remove("active");
  });
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

function reproducirAudio(button) {
  if (button.classList.contains("btn-audio")) {
    button.disabled = true;
    button.classList.add("disabled-temporal");
    setTimeout(() => {
      button.disabled = false;
      button.classList.remove("disabled-temporal");
    }, 3000);
  }

  const ruta = getRutaBase();
  playClickSound();

  const avatarID = avatarSeleccionado.toLowerCase();
  const vozID = avatares[avatarSeleccionado]?.vozID || avatarID;
  const contenedor = button.closest('.imagen-caja');
  const index = parseInt(contenedor.dataset.index);
  const step = parseInt(contenedor.dataset.step);
  const audioName = `video${index + 1}${step > 0 ? `_sub${step}` : ''}`;
  const videoURL = `${ruta}/videos/${vozID}/${audioName}.mp4`;
  const loader = document.getElementById("avatar-loader");
  avatar.classList.remove("hidden");
  video.classList.remove("playing");
  loader.classList.remove("hidden");

  // Verificar si el archivo de video existe antes de asignarlo
  fetch(videoURL, { method: "HEAD" })
    .then(res => {
      if (res.ok) {
        // El video existe
        video.src = videoURL;
        video.load();
        video.currentTime = 0;

        video.oncanplay = () => {
          loader.classList.add("hidden");
          avatar.classList.add("hidden");
          video.classList.add("playing");
          video.play().catch(() => {
            avatar.classList.remove("hidden");
            video.classList.remove("playing");
          });
        };

        video.onerror = () => {
          loader.classList.add("hidden");
          avatar.classList.remove("hidden");
          video.classList.remove("playing");
        };

      } else {
        // Video no existe, mostrar avatar
        loader.classList.add("hidden");
        avatar.classList.remove("hidden");
        video.classList.remove("playing");
        video.src = ""; // Limpia el video
      }
    })
    .catch(() => {
      // Error al verificar existencia del archivo
      loader.classList.add("hidden");
      avatar.classList.remove("hidden");
      video.classList.remove("playing");
      video.src = ""; // Limpia el video
    });

  // Subtítulos
  fetch(`${ruta}/textos/${audioName}.txt`)
    .then(res => res.ok ? res.text() : "")
    .then(texto => {
      const dialogueBox = document.getElementById("dialogue-box");
      if (dialogueBox) {
        escribirTextoGradualmente(texto || "", dialogueBox, 60);
      }
    })
    .catch(err => console.warn("No se pudo cargar el texto:", err));
}

/* cambio de sub imagenes ====================================*/
function cambiarSubimagen(button) {
  const contenedor = button.closest('.imagen-caja');
  const index = parseInt(contenedor.dataset.index);
  let step = parseInt(contenedor.dataset.step);
  const img = contenedor.querySelector('img');
  const retro = contenedor.querySelector('.btn-retroceso');
  const avanzar = contenedor.querySelector('.btn-subimg');
  const lista = imagenesPorCaja[index];

  playClickSound();

  if (step < lista.length - 1) {
    step++;

    contenedor.dataset.step = step;

    // Mostrar loader visual
    const overlay = document.createElement("div");
    overlay.className = "loader-overlay";
    const spinner = document.createElement("div");
    spinner.className = "loader-spinner";
    overlay.appendChild(spinner);
    contenedor.appendChild(overlay);

    // Animación de salida
    img.classList.add("slide-out-left");

    // ⚡ Imagen y audio al mismo tiempo
    const nuevaRuta = `${getRutaBase()}/imagenes/${lista[step].replace(/^.*\//, '')}`;
    img.src = nuevaRuta; // ← empieza a cargar de inmediato
    reproducirAudio(button); // ← también inmediatamente

    img.onload = () => {
      contenedor.removeChild(overlay);

      // Actualiza subtítulo
      const subtituloCaja = contenedor.parentElement.querySelector('.subtitulo-caja');
      const subtitulo = subtitulosPorCaja[index]?.[step] || "";
      if (subtituloCaja) subtituloCaja.textContent = subtitulo;

      // Animación de entrada
      img.classList.remove("slide-out-left");
      img.classList.add("slide-in-right");
      setTimeout(() => img.classList.remove("slide-in-right"), 400);

      // Mostrar u ocultar flechas según paso
      retro.style.display = step > 0 ? "block" : "none";
      avanzar.style.display = step >= lista.length - 1 ? "none" : "block";
    };
  }
}

function retrocederSubimagen(button) {
  const contenedor = button.closest('.imagen-caja');
  const index = parseInt(contenedor.dataset.index);
  let step = parseInt(contenedor.dataset.step);
  const img = contenedor.querySelector('img');
  const retro = contenedor.querySelector('.btn-retroceso');
  const avanzar = contenedor.querySelector('.btn-subimg');
  const lista = imagenesPorCaja[index];

  playClickSound();

  if (step > 0) {
    step--;

    // Mostrar loader
    const overlay = document.createElement("div");
    overlay.className = "loader-overlay";
    const spinner = document.createElement("div");
    spinner.className = "loader-spinner";
    overlay.appendChild(spinner);
    contenedor.appendChild(overlay);

    img.onload = () => {
      contenedor.removeChild(overlay);
      contenedor.dataset.step = step;

      const subtituloCaja = contenedor.parentElement.querySelector('.subtitulo-caja');
      const subtitulo = subtitulosPorCaja[index]?.[step] || "";
      if (subtituloCaja) subtituloCaja.textContent = subtitulo;

      retro.style.display = step > 0 ? "block" : "none";
      avanzar.style.display = step >= lista.length - 1 ? "none" : "block";

      // Mostrar con transición de entrada
      img.classList.remove("slide-out-right");
      img.classList.add("slide-in-left");
      setTimeout(() => img.classList.remove("slide-in-left"), 400);

      reproducirAudio(button);
    };
    img.src = `${getRutaBase()}/imagenes/${lista[step].replace(/^.*\//, '')}`;
  }
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

  const ruta = getRutaBase(); // = habitaciones/habitacion_1/seccion_1

  // Cargar el JSON con la galería
  const res = await fetch(`${ruta}/data.json`);
  const data = await res.json();

  imagenesPorCaja = data.imagenesPorCaja || {};
  subtitulosPorCaja = data.subtitulos || [];

  const galeriaSlider = document.getElementById("galeria-slider");
  galeriaSlider.innerHTML = "";
  marcarBotonActivo('seccion_1');

  // Crear solo el primer .item-galeria (index 0)
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

  // Inicializar imagen
  const contenedor = item.querySelector('.imagen-caja');
  const img = contenedor.querySelector('img');
  const step = 0;
  const nombreImagen = lista[step].replace(/^.*\//, '');
  img.src = `${ruta}/imagenes/${nombreImagen}`;

  // Esperar a que cargue completamente
  await new Promise((resolve) => {
    if (img.complete) {
      resolve();
    } else {
      img.onload = () => resolve();
      img.onerror = () => {
        console.warn("❌ No se pudo cargar la imagen inicial");
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

/*-------------------Juego----------------------------*/
function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
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

function registrarBoton(botonNombre) {
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
}
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
  });

  btnPrincipal?.addEventListener("click", () => {
    document.getElementById("welcome-screen")?.classList.add("hidden");
    document.getElementById("app")?.classList.remove("hidden");
    yaComenzo = true;
    cerrarJuegoYVolverImagen?.();        // Oculta el quiz
    cerrarImagenSuperpuesta?.();         // Oculta el mapa
    detenerVideoBienvenida()
  });

  btnQuiz?.addEventListener("click", () => {
    yaComenzo = true;
    document.getElementById("welcome-screen")?.classList.add("hidden");
    document.getElementById("app")?.classList.remove("hidden");
    iniciarJuego?.();
    detenerGuia();
    detenerVideoBienvenida()
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
