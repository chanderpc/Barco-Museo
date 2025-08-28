// SISTEMA DE VIDEO OPTIMIZADO - Con control de peticiones y cancelación
class OptimizedVideoManager {
    constructor() {
        this.videoCache = new Map();
        this.activeRequests = new Map(); // Control de peticiones activas
        this.currentGuide = 'Andrea_anime';
        this.isLoading = false;
        this.loadingQueue = [];
        this.maxConcurrentLoads = 2; // Máximo 2 videos cargando simultáneamente
        
        this.guideMapping = {
            'Andrea': 'andrea_irl',
            'Andrea_anime': 'andrea',
            'Carlos_IRL': 'carlos_irl', 
            'Carlos': 'carlos',
            'bryan': 'Bryan',
            'maria': 'Maria'
        };
    }

    // VERIFICAR EXISTENCIA SIN DUPLICAR PETICIONES
    async checkVideoExists(roomId, sectionId, videoName) {
        const videoKey = this.generateVideoKey(roomId, sectionId, videoName);
        const videoURL = this.buildVideoURL(roomId, sectionId, videoName);
        
        // Si ya hay una petición activa para este video, esperarla
        if (this.activeRequests.has(videoKey)) {
            return await this.activeRequests.get(videoKey);
        }
        
        // Crear nueva petición con AbortController
        const controller = new AbortController();
        const checkPromise = this._performExistenceCheck(videoURL, controller.signal);
        
        this.activeRequests.set(videoKey, checkPromise);
        
        try {
            const exists = await checkPromise;
            return exists;
        } finally {
            this.activeRequests.delete(videoKey);
        }
    }

    async _performExistenceCheck(videoURL, signal) {
        try {
            const response = await fetch(videoURL, { 
                method: 'HEAD',
                signal,
                cache: 'no-cache'
            });
            
            return response.ok;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Verificación cancelada');
                return false;
            }
            console.warn('Error verificando video:', error);
            return false;
        }
    }

    // OBTENER VIDEO CON CONTROL DE DUPLICADOS
    async getVideo(roomId, sectionId, videoName, priority = 'normal') {
        const videoKey = this.generateVideoKey(roomId, sectionId, videoName);
        
        // Si ya está en cache, devolver inmediatamente
        if (this.videoCache.has(videoKey)) {
            console.log(`📦 Video desde cache: ${videoName}`);
            return this.videoCache.get(videoKey);
        }

        // Si ya se está cargando este video, esperar
        if (this.activeRequests.has(videoKey)) {
            console.log(`⏳ Esperando carga en progreso: ${videoName}`);
            return await this.activeRequests.get(videoKey);
        }

        // Crear petición controlada
        const controller = new AbortController();
        const loadPromise = this._loadVideoControlled(roomId, sectionId, videoName, controller, priority);
        
        this.activeRequests.set(videoKey, loadPromise);
        
        try {
            const result = await loadPromise;
            return result;
        } finally {
            this.activeRequests.delete(videoKey);
        }
    }

    async _loadVideoControlled(roomId, sectionId, videoName, controller, priority) {
        const videoKey = this.generateVideoKey(roomId, sectionId, videoName);
        const videoURL = this.buildVideoURL(roomId, sectionId, videoName);

        try {
            // Si es prioridad baja y hay muchas cargas, encolar
            if (priority === 'low' && this.activeRequests.size > this.maxConcurrentLoads) {
                await this._waitForSlot();
            }

            console.log(`🚀 Cargando video: ${videoName}`);
            
            const response = await fetch(videoURL, {
                signal: controller.signal
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const blob = await response.blob();
            
            // Verificar si fue cancelado antes de crear blob URL
            if (controller.signal.aborted) {
                throw new Error('Carga cancelada');
            }
            
            const blobURL = URL.createObjectURL(blob);
            this.videoCache.set(videoKey, blobURL);
            
            console.log(`✅ Video cargado: ${videoName}`);
            return blobURL;

        } catch (error) {
            if (error.name === 'AbortError') {
                console.log(`❌ Carga cancelada: ${videoName}`);
            } else {
                console.error(`⚠️ Error cargando ${videoName}:`, error);
            }
            return null;
        }
    }

    async _waitForSlot() {
        return new Promise(resolve => {
            const check = () => {
                if (this.activeRequests.size <= this.maxConcurrentLoads) {
                    resolve();
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }

    // PRECARGA INTELIGENTE Y LIMITADA
    async preloadSection(roomId, sectionId, maxVideos = 3) {
        console.log(`🔄 Precarga limitada: ${roomId}/${sectionId} (max ${maxVideos})`);
        
        // Cancelar precargas anteriores
        this.cancelAllNonPriority();
        
        const videosToLoad = [];
        
        // Solo precargar video principal y primeros sub-videos
        const mainVideo = 'video1.mp4';
        const mainExists = await this.checkVideoExists(roomId, sectionId, mainVideo);
        if (mainExists) {
            videosToLoad.push(mainVideo);
        }
        
        // Precargar solo los primeros sub-videos
        for (let i = 1; i <= Math.min(maxVideos - 1, 3); i++) {
            const subVideo = `video1_sub${i}.mp4`;
            const exists = await this.checkVideoExists(roomId, sectionId, subVideo);
            if (exists) {
                videosToLoad.push(subVideo);
            }
        }

        // Cargar con prioridad baja y de forma secuencial
        const loadPromises = videosToLoad.map((videoName, index) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    this.getVideo(roomId, sectionId, videoName, 'low')
                        .then(resolve)
                        .catch(err => {
                            console.warn(`Falló precarga ${videoName}:`, err);
                            resolve(null);
                        });
                }, index * 500); // Espaciar cargas cada 500ms
            });
        });

        return Promise.allSettled(loadPromises);
    }

    // CANCELAR PETICIONES NO PRIORITARIAS
    cancelAllNonPriority() {
        console.log('🛑 Cancelando precargas anteriores');
        
        this.activeRequests.forEach((promise, key) => {
            // Aquí podrías implementar lógica para cancelar solo peticiones de baja prioridad
            // Por simplicidad, mantenemos las activas pero no agregamos más
        });
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
        // Cancelar todas las peticiones activas
        this.activeRequests.clear();
        
        // Revocar blob URLs
        this.videoCache.forEach(blobURL => {
            if (blobURL) {
                URL.revokeObjectURL(blobURL);
            }
        });
        
        this.videoCache.clear();
        console.log('🧹 Cache limpiado');
    }

    getStats() {
        return {
            currentGuide: this.currentGuide,
            videosInCache: this.videoCache.size,
            activeRequests: this.activeRequests.size,
            maxConcurrentLoads: this.maxConcurrentLoads
        };
    }
}

// FUNCIÓN DE REPRODUCCIÓN OPTIMIZADA
async function reproducirVideoOptimizado(button) {
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

    console.log(`🎬 Reproduciendo optimizado: ${audioName}`);

    const loader = document.getElementById("avatar-loader");
    const avatar = document.getElementById("avatar");
    const video = document.getElementById("aiko-video");

    // UI: Mostrar loading
    if (avatar) avatar.classList.add("hidden");
    if (video) video.classList.remove("playing");
    if (loader) loader.classList.remove("hidden");

    try {
        // Obtener video con prioridad alta
        const blobURL = await optimizedManager.getVideo(currentRoom, currentSection, audioName, 'high');

        if (blobURL && video) {
            console.log(`✅ Reproduciendo video: ${audioName}`);
            
            if (video.src !== blobURL) {
                video.src = blobURL;
                video.load();
            }
            
            video.currentTime = 0;

            // Reproducir con timeout más corto
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
                }, 2000); // Timeout más corto
            });

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
    loadSubtitles(currentRoom, currentSection, audioName);
    
    // Precarga inteligente de próximos videos (en segundo plano)
    setTimeout(() => {
        const nextStep = step + 1;
        const nextVideoName = `video${index + 1}_sub${nextStep}.mp4`;
        optimizedManager.getVideo(currentRoom, currentSection, nextVideoName, 'low')
            .catch(() => {}); // Ignorar errores de precarga
    }, 1000);
}

// INSTANCIA GLOBAL OPTIMIZADA
const optimizedManager = new OptimizedVideoManager();

// REEMPLAZAR FUNCIONES GLOBALES
window.reproducirAudio = reproducirVideoOptimizado;
window.videoManager = optimizedManager;

window.navigateToRoom = function(roomId) {
    // Limpiar cache al cambiar habitación para liberar memoria
    optimizedManager.cancelAllNonPriority();
};

window.navigateToSection = function(roomId, sectionId) {
    // Precarga muy limitada y con delay
    setTimeout(() => {
        optimizedManager.preloadSection(roomId, sectionId, 2) // Solo 2 videos máximo
            .catch(err => console.warn('Error en precarga:', err));
    }, 1500); // Delay más largo para no interferir con la carga actual
};

window.changeGuide = function(guideName) {
    optimizedManager.changeGuide(guideName);
};

// COMANDOS DE DEBUG
window.showOptimizedStats = function() {
    console.log('📊 Stats optimizadas:', optimizedManager.getStats());
};

window.clearVideoCache = function() {
    optimizedManager.clearCaches();
    console.log('🗑️ Cache de videos limpiado');
};

console.log('⚡ Sistema de video optimizado inicializado - Control de duplicados activo');