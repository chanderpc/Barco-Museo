// SISTEMA INTELIGENTE - Solo carga videos que existen
class SmartVideoPreloader {
    constructor() {
        this.videoCache = new Map();
        this.existingVideos = new Map(); // Cache de videos que SÍ existen
        this.nonExistentVideos = new Set(); // Cache de videos que NO existen
        this.currentGuide = 'Andrea_anime';
        
        this.guideMapping = {
            'Andrea': 'andrea_irl',
            'Andrea_anime': 'andrea',
            'Carlos_IRL': 'carlos_irl', 
            'Carlos': 'carlos',
            'bryan': 'Bryan',
            'maria': 'Maria'
        };
    }

    // VERIFICAR SI UN VIDEO EXISTE ANTES DE INTENTAR CARGARLO
    async checkVideoExists(roomId, sectionId, videoName) {
        const videoKey = this.generateVideoKey(roomId, sectionId, videoName);
        
        // Si ya sabemos que no existe, no intentar
        if (this.nonExistentVideos.has(videoKey)) {
            return false;
        }
        
        // Si ya verificamos que existe, devolver true
        if (this.existingVideos.has(videoKey)) {
            return true;
        }

        const videoURL = this.buildVideoURL(roomId, sectionId, videoName);
        
        try {
            // HEAD request para verificar existencia sin descargar
            const response = await fetch(videoURL, { 
                method: 'HEAD',
                cache: 'no-cache'
            });
            
            if (response.ok) {
                console.log(`✅ Video confirmado: ${videoName}`);
                this.existingVideos.set(videoKey, true);
                return true;
            } else {
                console.warn(`❌ Video no existe: ${videoName} (${response.status})`);
                this.nonExistentVideos.add(videoKey);
                return false;
            }
        } catch (error) {
            console.warn(`❌ Error verificando video: ${videoName}`, error);
            this.nonExistentVideos.add(videoKey);
            return false;
        }
    }

    // OBTENER VIDEO SOLO SI EXISTE
    async getVideo(roomId, sectionId, videoName) {
        const videoKey = this.generateVideoKey(roomId, sectionId, videoName);
        
        // Verificar existencia primero
        const exists = await this.checkVideoExists(roomId, sectionId, videoName);
        if (!exists) {
            console.warn(`🚫 Saltando video inexistente: ${videoName}`);
            return null;
        }

        // Si ya está en cache, devolver
        if (this.videoCache.has(videoKey)) {
            console.log(`📦 Video desde cache: ${videoName}`);
            return this.videoCache.get(videoKey);
        }

        // Cargar video
        try {
            const videoURL = this.buildVideoURL(roomId, sectionId, videoName);
            const response = await fetch(videoURL);
            
            if (!response.ok) {
                this.nonExistentVideos.add(videoKey);
                return null;
            }

            const blob = await response.blob();
            const blobURL = URL.createObjectURL(blob);
            
            this.videoCache.set(videoKey, blobURL);
            console.log(`✅ Video cargado: ${videoName}`);
            return blobURL;

        } catch (error) {
            console.error(`❌ Error cargando ${videoName}:`, error);
            this.nonExistentVideos.add(videoKey);
            return null;
        }
    }

    // ESCANEO INTELIGENTE DE SECCIÓN
    async scanSection(roomId, sectionId) {
        console.log(`🔍 Escaneando sección: ${roomId}/${sectionId}`);
        
        const baseVideoName = 'video1.mp4';
        const existingVideos = [];
        
        // Verificar video principal
        const mainExists = await this.checkVideoExists(roomId, sectionId, baseVideoName);
        if (mainExists) {
            existingVideos.push(baseVideoName);
        }

        // Verificar subvideos (hasta sub10 por si acaso)
        for (let i = 1; i <= 10; i++) {
            const subVideoName = `video1_sub${i}.mp4`;
            const exists = await this.checkVideoExists(roomId, sectionId, subVideoName);
            
            if (exists) {
                existingVideos.push(subVideoName);
            } else {
                // Si no existe sub1, probablemente tampoco existan los siguientes
                if (i === 1) break;
            }
        }

        console.log(`📋 Videos encontrados en ${sectionId}:`, existingVideos);
        return existingVideos;
    }

    // PRECARGA INTELIGENTE
    async preloadSection(roomId, sectionId) {
        console.log(`🚀 Precarga inteligente: ${roomId}/${sectionId}`);
        
        const existingVideos = await this.scanSection(roomId, sectionId);
        
        // Precargar solo videos que existen
        const preloadPromises = existingVideos.map((videoName, index) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    this.getVideo(roomId, sectionId, videoName)
                        .then(resolve)
                        .catch(err => {
                            console.warn(`Falló precarga ${videoName}:`, err);
                            resolve(null);
                        });
                }, index * 300);
            });
        });

        return Promise.allSettled(preloadPromises);
    }

    // UTILIDADES
    generateVideoKey(roomId, sectionId, videoName) {
        const guide = this.guideMapping[this.currentGuide] || 'andrea';
        return `${roomId}/${sectionId}/${guide}/${videoName}`;
    }

    buildVideoURL(roomId, sectionId, videoName) {
        const guide = this.guideMapping[this.currentGuide] || 'andrea';
        return `habitaciones/${roomId}/${sectionId}/videos/${guide}/${videoName}`;
    }

    changeGuide(newGuide) {
        if (newGuide === this.currentGuide) return;
        
        console.log(`👤 Cambiando guía: ${this.currentGuide} → ${newGuide}`);
        this.currentGuide = newGuide;
        
        // Limpiar caches al cambiar guía
        this.clearCaches();
    }

    clearCaches() {
        // Revocar blob URLs
        this.videoCache.forEach(blobURL => {
            URL.revokeObjectURL(blobURL);
        });
        
        this.videoCache.clear();
        this.existingVideos.clear();
        this.nonExistentVideos.clear();
    }

    getStats() {
        return {
            currentGuide: this.currentGuide,
            videosInCache: this.videoCache.size,
            existingVideos: this.existingVideos.size,
            nonExistentVideos: this.nonExistentVideos.size
        };
    }
}

// FUNCIÓN DE REPRODUCCIÓN ROBUSTA
async function reproducirAudioInteligente(button) {
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

    console.log(`🎬 Reproduciendo: ${audioName} en ${currentRoom}/${currentSection}`);

    const loader = document.getElementById("avatar-loader");
    const avatar = document.getElementById("avatar");
    const video = document.getElementById("aiko-video");

    // UI: Mostrar loading
    if (avatar) avatar.classList.add("hidden");
    if (video) video.classList.remove("playing");
    if (loader) loader.classList.remove("hidden");

    try {
        // INTENTAR OBTENER VIDEO CON VERIFICACIÓN DE EXISTENCIA
        const blobURL = await smartPreloader.getVideo(currentRoom, currentSection, audioName);

        if (blobURL && video) {
            console.log(`✅ Reproduciendo video existente: ${audioName}`);
            
            // Configurar video
            if (video.src !== blobURL) {
                video.src = blobURL;
                video.load();
            }
            
            video.currentTime = 0;

            // Reproducir con timeout
            await new Promise((resolve, reject) => {
                let resolved = false;
                
                const cleanup = () => {
                    video.removeEventListener('canplay', handleCanPlay);
                    video.removeEventListener('error', handleError);
                };

                const handleCanPlay = () => {
                    if (resolved) return;
                    resolved = true;
                    cleanup();
                    
                    if (loader) loader.classList.add("hidden");
                    video.classList.add("playing");
                    
                    video.play()
                        .then(resolve)
                        .catch(reject);
                };

                const handleError = (error) => {
                    if (resolved) return;
                    resolved = true;
                    cleanup();
                    reject(error);
                };

                video.addEventListener('canplay', handleCanPlay, { once: true });
                video.addEventListener('error', handleError, { once: true });

                setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        cleanup();
                        reject(new Error('Video timeout'));
                    }
                }, 3000);
            });

            // Configurar finalización
            video.onended = () => {
                video.classList.remove("playing");
                if (avatar) avatar.classList.remove("hidden");
            };

        } else {
            console.warn(`⚠️ Video no disponible: ${audioName}, solo mostrando avatar`);
            throw new Error(`Video no disponible: ${audioName}`);
        }

    } catch (error) {
        console.warn(`⚠️ Error reproduciendo ${audioName}:`, error);
        
        // Mostrar solo avatar si no hay video
        if (loader) loader.classList.add("hidden");
        if (avatar) avatar.classList.remove("hidden");
        if (video) video.classList.remove("playing");
    }

    // Cargar subtítulos (esto sí debería existir siempre)
    loadSubtitles(currentRoom, currentSection, audioName);
}

// FUNCIÓN PARA SUBTÍTULOS
async function loadSubtitles(currentRoom, currentSection, audioName) {
    try {
        const ruta = `habitaciones/${currentRoom}/${currentSection}`;
        const textoURL = `${ruta}/textos/${audioName.replace('.mp4', '.txt')}`;
        
        const response = await fetch(textoURL);
        const texto = response.ok ? await response.text() : "";
        
        const dialogueBox = document.getElementById("dialogue-box");
        if (dialogueBox && typeof escribirTextoGradualmente === 'function') {
            escribirTextoGradualmente(texto || "Información no disponible", dialogueBox, 60);
        }
    } catch (error) {
        console.warn(`No se pudo cargar texto para: ${audioName}`, error);
        
        const dialogueBox = document.getElementById("dialogue-box");
        if (dialogueBox && typeof escribirTextoGradualmente === 'function') {
            escribirTextoGradualmente("", dialogueBox, 60);
        }
    }
}

// INSTANCIA GLOBAL
const smartPreloader = new SmartVideoPreloader();

// REEMPLAZAR FUNCIÓN GLOBAL
window.reproducirAudio = reproducirAudioInteligente;
window.videoPreloader = smartPreloader;

// NAVEGACIÓN
window.navigateToRoom = function(roomId) {
    // No hacer nada, ya que scanSection se ejecutará cuando se necesite
};

window.navigateToSection = function(roomId, sectionId) {
    setTimeout(() => {
        smartPreloader.preloadSection(roomId, sectionId)
            .catch(err => console.warn('Error en precarga inteligente:', err));
    }, 1000);
};

window.changeGuide = function(guideName) {
    smartPreloader.changeGuide(guideName);
};

// DEBUG
window.showSmartStats = function() {
    console.log('📊 Stats inteligentes:', smartPreloader.getStats());
};

console.log('🧠 Sistema inteligente inicializado - Solo carga videos existentes');