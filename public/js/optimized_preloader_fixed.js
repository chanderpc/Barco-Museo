// Sistema de Precarga CON REUTILIZACIÓN REAL - Evita redescargas
// Solución que reutiliza videos sin triggerar nuevas descargas

class TrueCacheVideoPreloader {
    constructor() {
        this.videoPool = new Map();
        this.pendingRequests = new Map();
        this.videoBlobs = new Map(); // NUEVO: Cache de blobs
        this.currentGuide = 'Andrea_anime';
        this.currentRoom = null;
        this.currentSection = null;
        this.maxConcurrentLoads = 1;
        this.currentlyLoading = 0;
        
        // Configuración de habitaciones
        this.roomConfig = {
            habitacion_1: {
                totalSections: 16,
                videosPerSection: ['video1.mp4', 'video1_sub1.mp4', 'video1_sub2.mp4', 'video1_sub3.mp4', 'video1_sub4.mp4', 'video1_sub5.mp4']
            },
            habitacion_2: {
                totalSections: 18,
                videosPerSection: ['video1.mp4', 'video1_sub1.mp4', 'video1_sub2.mp4']
            },
            habitacion_3: {
                totalSections: 9,
                videosPerSection: ['video1.mp4']
            },
            habitacion_4: {
                totalSections: 20,
                videosPerSection: ['video1.mp4', 'video1_sub1.mp4', 'video1_sub2.mp4']
            },
            habitacion_5: {
                totalSections: 3,
                videosPerSection: ['video1.mp4']
            },
            habitacion_6: {
                totalSections: 1,
                videosPerSection: ['video1.mp4']
            }
        };

        this.guideMapping = {
            'Andrea': 'andrea_irl',
            'Andrea_anime': 'andrea',
            'Carlos_IRL': 'carlos_irl',
            'Carlos': 'carlos',
            'bryan': 'Bryan',
            'maria': 'Maria'
        };
    }

    // MÉTODO PRINCIPAL - CON BLOB CACHING
    async getVideo(roomId, sectionId, videoName) {
        const videoKey = this.generateVideoKey(roomId, sectionId, videoName);
        
        console.log(`🎬 Solicitando: ${videoName} (${videoKey})`);
        
        // 1️⃣ Si ya existe blob URL, devolverlo
        if (this.videoBlobs.has(videoKey)) {
            console.log(`✅ Video desde blob cache: ${videoName}`);
            return this.videoBlobs.get(videoKey);
        }

        // 2️⃣ Si está siendo cargado, esperar
        if (this.pendingRequests.has(videoKey)) {
            console.log(`⏳ Esperando carga pendiente: ${videoName}`);
            return await this.pendingRequests.get(videoKey);
        }

        // 3️⃣ Crear nueva promesa de carga con blob
        const loadPromise = this.loadVideoAsBlob(roomId, sectionId, videoName, videoKey);
        this.pendingRequests.set(videoKey, loadPromise);

        try {
            const result = await loadPromise;
            return result;
        } finally {
            this.pendingRequests.delete(videoKey);
        }
    }

    // CARGAR VIDEO COMO BLOB - EVITA REDESCARGAS
    async loadVideoAsBlob(roomId, sectionId, videoName, videoKey) {
        const videoURL = this.buildVideoURL(roomId, sectionId, videoName);

        // Control de concurrencia
        while (this.currentlyLoading >= this.maxConcurrentLoads) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        this.currentlyLoading++;
        console.log(`🔥 Cargando como blob: ${videoName}`);

        try {
            // Descargar como blob
            const response = await fetch(videoURL);
            if (!response.ok) {
                console.warn(`❌ No se pudo descargar: ${videoName}`);
                return null;
            }

            const blob = await response.blob();
            const blobURL = URL.createObjectURL(blob);
            
            console.log(`✅ Blob creado para: ${videoName}`);
            
            // Guardar blob URL en cache
            this.videoBlobs.set(videoKey, blobURL);
            
            return blobURL;

        } catch (error) {
            console.error(`❌ Error cargando blob ${videoName}:`, error);
            return null;
        } finally {
            this.currentlyLoading--;
        }
    }

    // FUNCIONES DE UTILIDAD
    generateVideoKey(roomId, sectionId, videoName, guideId = null) {
        const guide = guideId || this.guideMapping[this.currentGuide] || 'andrea';
        return `${roomId}/${sectionId}/${guide}/${videoName}`;
    }

    buildVideoURL(roomId, sectionId, videoName, guideId = null) {
        const guide = guideId || this.guideMapping[this.currentGuide] || 'andrea';
        return `habitaciones/${roomId}/${sectionId}/videos/${guide}/${videoName}`;
    }

    // PRECARGA DE HABITACIÓN
    async preloadRoom(roomId) {
        console.log(`🏠 Precargando habitación: ${roomId}`);
        this.currentRoom = roomId;

        const config = this.roomConfig[roomId];
        if (!config) return;

        // Precargar primeros videos de primeras 2 secciones
        for (let i = 1; i <= Math.min(2, config.totalSections); i++) {
            const sectionId = `seccion_${i}`;
            
            setTimeout(() => {
                this.getVideo(roomId, sectionId, 'video1.mp4')
                    .catch(err => console.warn(`Falló precarga ${roomId}/${sectionId}:`, err));
            }, i * 1000);
        }
    }

    // PRECARGA DE SECCIÓN
    async preloadSection(roomId, sectionId) {
        console.log(`📂 Precargando sección: ${roomId}/${sectionId}`);
        this.currentSection = sectionId;

        const config = this.roomConfig[roomId];
        if (!config) return;

        config.videosPerSection.forEach((videoName, index) => {
            setTimeout(() => {
                this.getVideo(roomId, sectionId, videoName)
                    .catch(err => console.warn(`Falló precarga ${videoName}:`, err));
            }, index * 600);
        });
    }

    // CAMBIO DE GUÍA
    changeGuide(newGuide) {
        if (newGuide === this.currentGuide) return;

        console.log(`👤 Cambiando guía: ${this.currentGuide} → ${newGuide}`);
        this.currentGuide = newGuide;
        
        this.clearAll();
        
        if (this.currentRoom) {
            setTimeout(() => this.preloadRoom(this.currentRoom), 1500);
        }
    }

    // LIMPIEZA CON REVOCACIÓN DE BLOB URLS
    clearAll() {
        console.log(`🧹 Limpiando sistema completo`);
        
        // Revocar blob URLs para liberar memoria
        this.videoBlobs.forEach(blobURL => {
            URL.revokeObjectURL(blobURL);
        });
        
        this.videoPool.clear();
        this.videoBlobs.clear();
        this.pendingRequests.clear();
        this.currentlyLoading = 0;
    }

    // ESTADÍSTICAS
    getStats() {
        return {
            currentGuide: this.currentGuide,
            currentRoom: this.currentRoom,
            currentSection: this.currentSection,
            videosInPool: this.videoPool.size,
            blobsInCache: this.videoBlobs.size,
            pendingRequests: this.pendingRequests.size,
            currentlyLoading: this.currentlyLoading
        };
    }
}

// 🌍 INSTANCIA GLOBAL
const trueCachePreloader = new TrueCacheVideoPreloader();

// 📱 FUNCIÓN DE REPRODUCCIÓN QUE USA BLOB URLs
async function reproducirAudioConCache(button) {
    if (button.disabled) return;
    
    button.disabled = true;
    setTimeout(() => button.disabled = false, 1500);

    if (typeof playClickSound === 'function') {
        playClickSound();
    }

    const contenedor = button.closest('.imagen-caja');
    if (!contenedor) {
        console.error("No se encontró contenedor");
        return;
    }

    const index = parseInt(contenedor.dataset.index) || 0;
    const step = parseInt(contenedor.dataset.step) || 0;
    const audioName = `video${index + 1}${step > 0 ? `_sub${step}` : ''}.mp4`;

    let currentRoom = window.habitacionActual || 'habitacion_1';
    let currentSection = window.seccionActual || 'seccion_1';

    if (button.dataset.habitacion) currentRoom = button.dataset.habitacion;
    if (button.dataset.seccion) currentSection = button.dataset.seccion;

    console.log(`🎬 Reproduciendo: ${audioName} en ${currentRoom}/${currentSection}`);

    const loader = document.getElementById("avatar-loader");
    const avatar = document.getElementById("avatar");
    const video = document.getElementById("aiko-video");

    // UI: Mostrar loading
    if (avatar) avatar.classList.add("hidden");
    if (video) video.classList.remove("playing");
    if (loader) loader.classList.remove("hidden");

    try {
        // 🎥 OBTENER BLOB URL (NO REDESCARGA)
        const blobURL = await trueCachePreloader.getVideo(
            currentRoom,
            currentSection,
            audioName
        );

        if (blobURL && video) {
            console.log(`✅ Usando blob URL para: ${audioName}`);
            
            // CRÍTICO: Usar blob URL evita redescarga
            const currentSrc = video.src;
            
            if (currentSrc !== blobURL) {
                video.src = blobURL;
                video.load();
            }
            
            video.currentTime = 0;

            // Reproducción con manejo robusto
            const playPromise = new Promise((resolve, reject) => {
                let resolved = false;

                const handleCanPlay = () => {
                    if (!resolved) {
                        resolved = true;
                        if (loader) loader.classList.add("hidden");
                        if (avatar) avatar.classList.add("hidden");
                        video.classList.add("playing");
                        
                        video.play()
                            .then(() => {
                                console.log(`▶️ Reproduciendo: ${audioName}`);
                                resolve();
                            })
                            .catch(reject);
                    }
                };

                const handleError = (error) => {
                    if (!resolved) {
                        resolved = true;
                        reject(error);
                    }
                };

                video.addEventListener('canplay', handleCanPlay, { once: true });
                video.addEventListener('error', handleError, { once: true });

                setTimeout(() => {
                    if (!resolved) {
                        handleError(new Error('Timeout'));
                    }
                }, 5000);
            });

            video.onended = () => {
                video.classList.remove("playing");
                if (avatar) avatar.classList.remove("hidden");
            };

            await playPromise;

        } else {
            throw new Error('Video blob no disponible');
        }

    } catch (error) {
        console.error(`❌ Error reproduciendo ${audioName}:`, error);
        
        if (loader) loader.classList.add("hidden");
        if (avatar) avatar.classList.remove("hidden");
        if (video) video.classList.remove("playing");
    }

    // 📄 CARGAR SUBTÍTULOS
    const ruta = `habitaciones/${currentRoom}/${currentSection}`;
    const textoURL = `${ruta}/textos/${audioName.replace('.mp4', '.txt')}`;
    
    fetch(textoURL)
        .then(res => res.ok ? res.text() : "")
        .then(texto => {
            const dialogueBox = document.getElementById("dialogue-box");
            if (dialogueBox && typeof escribirTextoGradualmente === 'function') {
                escribirTextoGradualmente(texto || "", dialogueBox, 60);
            }
        })
        .catch(err => console.warn("No texto disponible:", err));
}

// 🔗 NAVEGACIÓN
window.navigateToRoom = function(roomId) {
    trueCachePreloader.preloadRoom(roomId);
};

window.navigateToSection = function(roomId, sectionId) {
    trueCachePreloader.preloadSection(roomId, sectionId);
};

window.changeGuide = function(guideName) {
    trueCachePreloader.changeGuide(guideName);
};

// 🛠️ DEBUG
window.showPreloaderStats = function() {
    console.log('📊 Stats:', trueCachePreloader.getStats());
};

window.clearVideoCache = function() {
    trueCachePreloader.clearAll();
};

// ✅ REEMPLAZAR FUNCIÓN GLOBAL
window.reproducirAudio = reproducirAudioConCache;
window.videoPreloader = trueCachePreloader;

console.log('🚀 Sistema TRUE CACHE inicializado - Videos no se redescargan');
