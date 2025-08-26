// Sistema de Precarga Optimizado para Barco Museo - CORREGIDO
// Evita duplicados y coordina la carga de videos

class OptimizedVideoPreloader {
    constructor() {
        this.videoPool = new Map(); // Pool único de videos
        this.loadingPromises = new Map(); // Promesas de carga activas
        this.currentGuide = 'Andrea_anime'; // Guía por defecto
        this.currentRoom = null;
        this.currentSection = null;
        this.maxConcurrentLoads = 3; // Máximo 3 videos cargando simultáneamente
        this.currentlyLoading = 0;
        
        // Configuración de habitaciones basada en tu código actual
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

        // Mapeo de avatares a carpetas de videos
        this.guideMapping = {
            'Andrea': 'andrea_irl',
            'Andrea_anime': 'andrea',
            'Carlos_IRL': 'carlos_irl',
            'Carlos': 'carlos',
            'bryan': 'Bryan',
            'maria': 'Maria'
        };

        // 🔥 NUEVO: Sistema de dedupe para evitar cargas múltiples
        this.pendingRequests = new Map();
    }

    // Generar clave única para cada video
    generateVideoKey(roomId, sectionId, videoName, guideId = null) {
        const guide = guideId || this.guideMapping[this.currentGuide] || 'andrea';
        return `${roomId}/${sectionId}/${guide}/${videoName}`;
    }

    // Construir URL del video
    buildVideoURL(roomId, sectionId, videoName, guideId = null) {
        const guide = guideId || this.guideMapping[this.currentGuide] || 'andrea';
        return `habitaciones/${roomId}/${sectionId}/videos/${guide}/${videoName}`;
    }

    // 🚀 MÉTODO PRINCIPAL - DEDUPLICADO
    async getVideo(roomId, sectionId, videoName) {
        const videoKey = this.generateVideoKey(roomId, sectionId, videoName);
        
        console.log(`🎬 Solicitando video: ${videoName} (key: ${videoKey})`);
        
        // 1️⃣ Si ya existe en el pool, devolverlo inmediatamente
        if (this.videoPool.has(videoKey)) {
            const video = this.videoPool.get(videoKey);
            console.log(`✅ Video desde cache: ${videoName}`);
            return video;
        }

        // 2️⃣ Si hay una petición pendiente para este mismo video, esperarla
        if (this.pendingRequests.has(videoKey)) {
            console.log(`⏳ Esperando carga existente de: ${videoName}`);
            return await this.pendingRequests.get(videoKey);
        }

        // 3️⃣ Crear nueva petición
        const loadPromise = this.loadVideoInternal(roomId, sectionId, videoName, videoKey);
        this.pendingRequests.set(videoKey, loadPromise);

        try {
            const result = await loadPromise;
            return result;
        } finally {
            // ✅ Limpiar la petición pendiente cuando termine
            this.pendingRequests.delete(videoKey);
        }
    }

    // 🔧 CARGA INTERNA CON CONTROL DE CONCURRENCIA
    async loadVideoInternal(roomId, sectionId, videoName, videoKey) {
        const videoURL = this.buildVideoURL(roomId, sectionId, videoName);

        // Esperar si hay demasiadas cargas simultáneas
        while (this.currentlyLoading >= this.maxConcurrentLoads) {
            await this.waitForSlot();
        }

        this.currentlyLoading++;
        console.log(`🔄 Cargando video: ${videoName} (${this.currentlyLoading}/${this.maxConcurrentLoads})`);

        try {
            const video = await this.createVideoElement(videoKey, videoURL, videoName);
            
            if (video) {
                this.videoPool.set(videoKey, video);
                console.log(`✅ Video cargado y guardado: ${videoName}`);
            }
            
            return video;
        } catch (error) {
            console.error(`❌ Error cargando ${videoName}:`, error);
            return null;
        } finally {
            this.currentlyLoading--;
        }
    }

    // 🎥 CREAR ELEMENTO VIDEO
    createVideoElement(videoKey, videoURL, videoName) {
        return new Promise((resolve) => {
            // Verificar primero si el archivo existe
            fetch(videoURL, { method: 'HEAD' })
                .then(response => {
                    if (!response.ok) {
                        console.log(`⚠️ Video no existe: ${videoName}`);
                        resolve(null);
                        return;
                    }

                    // Crear elemento video
                    const video = document.createElement('video');
                    video.preload = 'auto';
                    video.muted = true;
                    video.playsInline = true;
                    video.crossOrigin = 'anonymous';

                    let resolved = false;

                    const handleSuccess = () => {
                        if (!resolved) {
                            resolved = true;
                            console.log(`✅ Video elemento creado: ${videoName}`);
                            resolve(video);
                        }
                    };

                    const handleError = (error) => {
                        if (!resolved) {
                            resolved = true;
                            console.error(`❌ Error creando elemento ${videoName}:`, error);
                            resolve(null);
                        }
                    };

                    // Eventos de carga
                    video.addEventListener('canplaythrough', handleSuccess, { once: true });
                    video.addEventListener('loadeddata', handleSuccess, { once: true });
                    video.addEventListener('error', handleError, { once: true });

                    // Timeout de seguridad
                    setTimeout(() => {
                        if (!resolved) {
                            console.warn(`⚠️ Timeout cargando: ${videoName}`);
                            handleError(new Error('Timeout'));
                        }
                    }, 8000);

                    // 🚀 INICIAR CARGA
                    video.src = videoURL;
                })
                .catch(error => {
                    console.error(`❌ Error verificando ${videoName}:`, error);
                    resolve(null);
                });
        });
    }

    // ⏳ ESPERAR SLOT DISPONIBLE
    async waitForSlot() {
        return new Promise(resolve => {
            const checkSlot = () => {
                if (this.currentlyLoading < this.maxConcurrentLoads) {
                    resolve();
                } else {
                    setTimeout(checkSlot, 200);
                }
            };
            checkSlot();
        });
    }

    // 🏠 PRECARGAR HABITACIÓN (solo primeros videos)
    async preloadRoom(roomId) {
        console.log(`🏠 Precargando habitación: ${roomId}`);
        this.currentRoom = roomId;

        const config = this.roomConfig[roomId];
        if (!config) {
            console.warn(`⚠️ Configuración no encontrada para ${roomId}`);
            return;
        }

        // Precargar solo los primeros videos de las primeras 3 secciones
        const preloadPromises = [];
        const sectionsToPreload = Math.min(3, config.totalSections);

        for (let i = 1; i <= sectionsToPreload; i++) {
            const sectionId = `seccion_${i}`;
            const firstVideo = config.videosPerSection[0]; // Primer video de cada sección

            if (firstVideo) {
                // 🚀 Usar loadVideoInternal directamente para evitar duplicar lógica
                const videoKey = this.generateVideoKey(roomId, sectionId, firstVideo);
                
                if (!this.videoPool.has(videoKey) && !this.pendingRequests.has(videoKey)) {
                    const promise = this.loadVideoInternal(roomId, sectionId, firstVideo, videoKey)
                        .catch(err => console.warn(`Falló precarga de ${roomId}/${sectionId}/${firstVideo}:`, err));
                    preloadPromises.push(promise);
                }
            }
        }

        // Iniciar todas las precargas sin esperar
        Promise.allSettled(preloadPromises).then(results => {
            const successful = results.filter(r => r.status === 'fulfilled' && r.value !== null).length;
            console.log(`🎬 Habitación ${roomId}: ${successful}/${preloadPromises.length} videos precargados`);
        });
    }

    // 📍 PRECARGAR SECCIÓN ESPECÍFICA
    async preloadSection(roomId, sectionId) {
        console.log(`📍 Precargando sección: ${roomId}/${sectionId}`);
        this.currentSection = sectionId;

        const config = this.roomConfig[roomId];
        if (!config) return;

        // Precargar todos los videos de la sección actual
        const preloadPromises = config.videosPerSection.map((videoName, index) => {
            const videoKey = this.generateVideoKey(roomId, sectionId, videoName);
            
            // Solo precargar si no existe ya
            if (!this.videoPool.has(videoKey) && !this.pendingRequests.has(videoKey)) {
                // Prioridad: primer video inmediatamente, otros con delay
                const delay = index === 0 ? 0 : index * 300;
                
                return new Promise(resolve => {
                    setTimeout(() => {
                        this.loadVideoInternal(roomId, sectionId, videoName, videoKey)
                            .then(resolve)
                            .catch(err => {
                                console.warn(`Falló precarga de ${videoName}:`, err);
                                resolve(null);
                            });
                    }, delay);
                });
            }
            return Promise.resolve(null);
        });

        Promise.allSettled(preloadPromises).then(() => {
            console.log(`📍 Sección ${sectionId} precargada completamente`);
        });
    }

    // 👤 CAMBIAR GUÍA
    changeGuide(newGuide) {
        if (newGuide === this.currentGuide) return;

        console.log(`👤 Cambiando guía: ${this.currentGuide} → ${newGuide}`);
        this.currentGuide = newGuide;
        
        // Limpiar pool completo
        this.clearPool();
        
        // Reprecargar habitación actual con nueva guía
        if (this.currentRoom) {
            setTimeout(() => this.preloadRoom(this.currentRoom), 500);
        }
    }

    // 🧹 LIMPIAR POOL
    clearPool() {
        console.log(`🧹 Limpiando pool de videos (${this.videoPool.size} elementos)`);
        
        this.videoPool.forEach(video => {
            if (video) {
                video.src = '';
                video.load(); // Liberar recursos
            }
        });
        
        this.videoPool.clear();
        this.pendingRequests.clear(); // 🔥 También limpiar peticiones pendientes
    }

    // 🗑️ LIMPIAR NO UTILIZADOS
    cleanupUnused() {
        if (this.videoPool.size <= 8) return;

        const currentRoomPattern = this.currentRoom ? `${this.currentRoom}/` : '';
        const currentSectionPattern = this.currentSection ? `/${this.currentSection}/` : '';
        
        const toKeep = new Map();
        const toRemove = [];

        this.videoPool.forEach((video, key) => {
            const isCurrentRoom = key.includes(currentRoomPattern);
            const isCurrentSection = key.includes(currentSectionPattern);
            
            if (isCurrentRoom || isCurrentSection) {
                toKeep.set(key, video);
            } else {
                toRemove.push({ key, video });
            }
        });

        // Remover videos no relevantes
        toRemove.forEach(({ key, video }) => {
            if (video) {
                video.src = '';
                video.load();
            }
            this.videoPool.delete(key);
        });

        console.log(`🧹 Limpieza: mantenidos ${toKeep.size}, removidos ${toRemove.length}`);
    }

    // 📊 ESTADÍSTICAS
    getStats() {
        return {
            currentGuide: this.currentGuide,
            currentRoom: this.currentRoom,
            currentSection: this.currentSection,
            videosInPool: this.videoPool.size,
            currentlyLoading: this.currentlyLoading,
            pendingRequests: this.pendingRequests.size,
            loadingPromises: this.loadingPromises.size
        };
    }
}

// 🌍 INSTANCIA GLOBAL
const optimizedPreloader = new OptimizedVideoPreloader();

// 🔗 INTEGRACIÓN CON TU CÓDIGO EXISTENTE
window.videoPreloader = optimizedPreloader;

// 🎵 FUNCIÓN OPTIMIZADA PARA REPRODUCIR AUDIO (reemplaza completamente la tuya)
async function reproducirAudioOptimizado(button) {
    // Prevenir múltiples clics
    if (button.classList.contains("btn-audio")) {
        button.disabled = true;
        button.classList.add("disabled-temporal");
        setTimeout(() => {
            button.disabled = false;
            button.classList.remove("disabled-temporal");
        }, 3000);
    }

    // Sonido de clic
    if (typeof playClickSound === 'function') {
        playClickSound();
    }

    const contenedor = button.closest('.imagen-caja');
    const index = parseInt(contenedor.dataset.index);
    const step = parseInt(contenedor.dataset.step);
    const audioName = `video${index + 1}${step > 0 ? `_sub${step}` : ''}.mp4`;

    // 🔥 OBTENER HABITACIÓN Y SECCIÓN ACTUAL CORRECTAMENTE
    let currentRoom = window.habitacionActual;
    let currentSection = window.seccionActual;

    // Si no están definidas, intentar obtenerlas desde el botón
    if (!currentRoom || !currentSection) {
        const dataHabitacion = button.dataset.habitacion;
        const dataSeccion = button.dataset.seccion;
        
        if (dataHabitacion) currentRoom = dataHabitacion;
        if (dataSeccion) currentSection = dataSeccion;
    }

    // También intentar obtenerlas desde getRutaBase si existe
    if (!currentRoom || !currentSection) {
        if (typeof getRutaBase === 'function') {
            const ruta = getRutaBase();
            const partes = ruta.split('/');
            if (partes.length >= 3) {
                currentRoom = partes[1];
                currentSection = partes[2];
            }
        }
    }

    // Fallback final solo si realmente no hay nada
    if (!currentRoom) currentRoom = 'habitacion_1';
    if (!currentSection) currentSection = 'seccion_1';

    console.log(`🎬 Reproduciendo: ${audioName} en ${currentRoom}/${currentSection}`);

    const loader = document.getElementById("avatar-loader");
    const avatar = document.getElementById("avatar");
    const video = document.getElementById("aiko-video");

    // UI: Mostrar loader
    if (avatar) avatar.classList.remove("hidden");
    if (video) video.classList.remove("playing");
    if (loader) loader.classList.remove("hidden");

    try {
        // 🎬 OBTENER VIDEO DEL SISTEMA OPTIMIZADO con rutas correctas
        const preloadedVideo = await optimizedPreloader.getVideo(
            currentRoom,
            currentSection,
            audioName
        );

        if (preloadedVideo && video) {
            // Usar video precargado
            video.src = preloadedVideo.src;
            video.currentTime = 0;

            video.oncanplay = () => {
                if (loader) loader.classList.add("hidden");
                if (avatar) avatar.classList.add("hidden");
                video.classList.add("playing");
                video.play().catch(err => {
                    console.warn("Error al reproducir video:", err);
                    if (avatar) avatar.classList.remove("hidden");
                    video.classList.remove("playing");
                });
            };

            video.onerror = () => {
                if (loader) loader.classList.add("hidden");
                if (avatar) avatar.classList.remove("hidden");
                video.classList.remove("playing");
            };
        } else {
            // Sin video disponible
            if (loader) loader.classList.add("hidden");
            if (avatar) avatar.classList.remove("hidden");
            if (video) video.classList.remove("playing");
        }

    } catch (error) {
        console.error("Error reproduciendo video:", error);
        if (loader) loader.classList.add("hidden");
        if (avatar) avatar.classList.remove("hidden");
        if (video) video.classList.remove("playing");
    }

    // 📝 CARGAR SUBTÍTULOS con rutas correctas
    const ruta = `habitaciones/${currentRoom}/${currentSection}`;
    
    fetch(`${ruta}/textos/${audioName.replace('.mp4', '.txt')}`)
        .then(res => res.ok ? res.text() : "")
        .then(texto => {
            const dialogueBox = document.getElementById("dialogue-box");
            if (dialogueBox && typeof escribirTextoGradualmente === 'function') {
                escribirTextoGradualmente(texto || "", dialogueBox, 60);
            }
        })
        .catch(err => console.warn("No se pudo cargar el texto:", err));
}

// 🚀 FUNCIONES DE NAVEGACIÓN OPTIMIZADAS
window.navigateToRoom = function(roomId) {
    console.log(`🏠 Navegación optimizada a: ${roomId}`);
    optimizedPreloader.preloadRoom(roomId);
    
    // Limpiar videos no utilizados después de un tiempo
    setTimeout(() => optimizedPreloader.cleanupUnused(), 5000);
};

window.navigateToSection = function(roomId, sectionId) {
    console.log(`📍 Navegación optimizada a: ${roomId}/${sectionId}`);
    optimizedPreloader.preloadSection(roomId, sectionId);
};

window.changeGuide = function(guideName) {
    optimizedPreloader.changeGuide(guideName);
};

// 🐛 DEBUG
window.showPreloaderStats = function() {
    console.log('📊 Estadísticas del preloader:', optimizedPreloader.getStats());
};

// ✅ REEMPLAZAR LA FUNCIÓN reproducirAudio GLOBALMENTE
window.reproducirAudio = reproducirAudioOptimizado;

console.log('🚀 Sistema de precarga optimizado inicializado y mejorado');
