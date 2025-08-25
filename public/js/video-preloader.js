// Sistema de Precarga Inteligente para Barco Museo - Multi Guías
// Dinámico para 6 guías diferentes

class VideoPreloader {
    constructor() {
        this.preloadedVideos = new Set();
        this.videoCache = new Map();
        this.currentRoom = null;
        this.currentSection = null;
        this.currentGuide = 'andrea'; // Guía por defecto
        
        // Lista de guías disponibles
        this.guides = [
            'andrea',
            'andrea_irl', 
            'carlos',
            'carlos_irl',
            'bryan',
            'maria'
        ];
        
        // Configuración dinámica de habitaciones
        // Se genera automáticamente para cada guía
        this.roomStructure = {
            habitacion_1: {
                sections: ['seccion_1', 'seccion_2', 'seccion_3'],
                videosPerSection: {
                    seccion_1: ['video1.mp4', 'video1_sub1.mp4', 'video1_sub2.mp4', 'video1_sub3.mp4', 'video1_sub4.mp4'], // Videos comunes por sección
                    seccion_2: ['video1.mp4', 'video1_sub1.mp4', 'video1_sub2.mp4', 'video1_sub3.mp4', 'video1_sub4.mp4'],
                    seccion_3: ['video1.mp4'],
                    seccion_4: ['video1.mp4', 'video1_sub1.mp4', 'video1_sub2.mp4', 'video1_sub3.mp4', 'video1_sub4.mp4', 'video1_sub5.mp4'],
                    seccion_5: ['video1.mp4', 'video1_sub1.mp4', 'video1_sub2.mp4', 'video1_sub3.mp4', 'video1_sub4.mp4'],
                    seccion_6: ['video1.mp4']
                }
            },
            habitacion_2: {
                sections: ['seccion_1', 'seccion_2'],
                videosPerSection: {
                    seccion_1: ['video1.mp4'],
                    seccion_2: ['video1.mp4']
                }
            },
            habitacion_3: {
                sections: ['seccion_1'],
                videosPerSection: {
                    seccion_1: ['video1.mp4']
                }
            }
            // Agregar más habitaciones según necesites
        };
    }

    // Cambiar guía actual y limpiar cache
    setGuide(guideName) {
        if (!this.guides.includes(guideName)) {
            console.warn(`❌ Guía "${guideName}" no válida. Guías disponibles:`, this.guides);
            return false;
        }
        
        const previousGuide = this.currentGuide;
        this.currentGuide = guideName;
        
        console.log(`👤 Cambiando guía: ${previousGuide} → ${guideName}`);
        
        // Limpiar cache de guía anterior
        if (previousGuide !== guideName) {
            this.clearCache();
        }
        
        return true;
    }

    // Generar ruta dinámica basada en guía actual
    buildVideoPath(roomId, sectionId, videoFileName) {
        return `/habitaciones/${roomId}/${sectionId}/videos/${this.currentGuide}/${videoFileName}`;
    }

    // Obtener todos los videos de una sección para la guía actual
    getSectionVideos(roomId, sectionId) {
        const roomConfig = this.roomStructure[roomId];
        if (!roomConfig || !roomConfig.videosPerSection[sectionId]) {
            return [];
        }
        
        return roomConfig.videosPerSection[sectionId].map(video => 
            this.buildVideoPath(roomId, sectionId, video)
        );
    }

    // Precargar videos al entrar a una habitación
    preloadRoomVideos(roomId) {
        console.log(`🚢 Precargando videos de ${roomId} para guía: ${this.currentGuide}...`);
        
        const roomConfig = this.roomStructure[roomId];
        if (!roomConfig) {
            console.warn(`Configuración no encontrada para ${roomId}`);
            return;
        }

        // Precargar el primer video de cada sección (prioridad alta)
        roomConfig.sections.forEach(sectionId => {
            const firstVideo = roomConfig.videosPerSection[sectionId]?.[0];
            if (firstVideo) {
                const videoPath = this.buildVideoPath(roomId, sectionId, firstVideo);
                this.preloadVideo(videoPath, 'high');
            }
        });

        this.currentRoom = roomId;
    }

    // Precargar todos los videos de una sección específica
    preloadSectionVideos(roomId, sectionId) {
        console.log(`📹 Precargando videos de ${roomId}/${sectionId} para guía: ${this.currentGuide}...`);
        
        const videos = this.getSectionVideos(roomId, sectionId);
        
        videos.forEach((videoPath, index) => {
            const priority = index === 0 ? 'high' : 'medium';
            
            // Retraso progresivo para no saturar la red
            setTimeout(() => {
                this.preloadVideo(videoPath, priority);
            }, index * 500);
        });

        this.currentSection = sectionId;
    }

    // Función principal de precarga
    preloadVideo(videoUrl, priority = 'medium') {
        // Evitar precargar duplicados
        if (this.preloadedVideos.has(videoUrl)) {
            return Promise.resolve(this.videoCache.get(videoUrl));
        }

        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.preload = 'auto';
            video.muted = true;
            video.playsInline = true;
            video.src = videoUrl;

            // Configurar basado en prioridad
            if (priority === 'high') {
                video.preload = 'auto';
            } else {
                video.preload = 'metadata';
            }

            video.addEventListener('canplaythrough', () => {
                this.videoCache.set(videoUrl, video);
                this.preloadedVideos.add(videoUrl);
                console.log(`✅ Precargado (${priority}): ${videoUrl.split('/').pop()}`);
                resolve(video);
            });

            video.addEventListener('error', (e) => {
                console.error(`❌ Error precargando: ${videoUrl}`, e);
                reject(e);
            });

            // Iniciar precarga
            video.load();
        });
    }

    // Reproducir video con cache inteligente
    async playVideo(roomId, sectionId, videoFileName, videoElement = null) {
        const videoPath = this.buildVideoPath(roomId, sectionId, videoFileName);
        
        // Intentar usar video precargado
        if (this.videoCache.has(videoPath)) {
            const cachedVideo = this.videoCache.get(videoPath);
            
            if (videoElement) {
                // Transferir al elemento del DOM
                videoElement.src = videoPath;
                videoElement.currentTime = 0;
                return videoElement.play();
            } else {
                // Usar video cacheado directamente
                cachedVideo.currentTime = 0;
                return cachedVideo.play();
            }
        }

        // Fallback: cargar normalmente
        console.log(`⏳ Cargando video no precargado: ${videoPath}`);
        if (videoElement) {
            videoElement.src = videoPath;
            videoElement.currentTime = 0;
            return videoElement.play();
        }

        // Crear nuevo elemento si no se proporciona
        const video = document.createElement('video');
        video.src = videoPath;
        video.muted = true;
        video.playsInline = true;
        return video.play();
    }

    // Precargar secciones adyacentes
    preloadAdjacentSections(roomId, currentSectionId) {
        const roomConfig = this.roomStructure[roomId];
        if (!roomConfig) return;

        const currentIndex = roomConfig.sections.indexOf(currentSectionId);
        if (currentIndex === -1) return;

        // Precargar sección anterior y siguiente
        const adjacentIndices = [currentIndex - 1, currentIndex + 1];
        
        adjacentIndices.forEach(index => {
            if (index >= 0 && index < roomConfig.sections.length) {
                const sectionId = roomConfig.sections[index];
                const firstVideo = roomConfig.videosPerSection[sectionId]?.[0];
                
                if (firstVideo) {
                    const videoPath = this.buildVideoPath(roomId, sectionId, firstVideo);
                    setTimeout(() => {
                        this.preloadVideo(videoPath, 'low');
                    }, 1000);
                }
            }
        });
    }

    // Limpiar cache completamente
    clearCache() {
        console.log(`🧹 Limpiando cache completo (${this.videoCache.size} videos)...`);
        
        this.videoCache.forEach((video, url) => {
            video.src = '';
            video.load(); // Liberar recursos
        });
        
        this.videoCache.clear();
        this.preloadedVideos.clear();
    }

    // Limpiar cache parcial para liberar memoria
    cleanupUnusedVideos() {
        const maxCacheSize = 12; // Máximo 12 videos en cache
        
        if (this.videoCache.size > maxCacheSize) {
            const entries = Array.from(this.videoCache.entries());
            const toRemove = entries.slice(0, entries.length - maxCacheSize);
            
            toRemove.forEach(([url, video]) => {
                video.src = '';
                video.load();
                this.videoCache.delete(url);
                this.preloadedVideos.delete(url);
            });
            
            console.log(`🧹 Limpiado cache parcial: ${toRemove.length} videos removidos`);
        }
    }

    // Navegación inteligente
    onNavigateToRoom(roomId) {
        // Limpiar cache anterior si cambiamos de habitación
        if (this.currentRoom && this.currentRoom !== roomId) {
            this.cleanupUnusedVideos();
        }
        
        // Precargar nueva habitación
        this.preloadRoomVideos(roomId);
    }

    onNavigateToSection(roomId, sectionId) {
        // Precargar sección completa
        this.preloadSectionVideos(roomId, sectionId);
        
        // Precargar secciones adyacentes (baja prioridad)
        setTimeout(() => {
            this.preloadAdjacentSections(roomId, sectionId);
        }, 2000);
    }

    // Precargar videos de todas las guías para una sección específica
    preloadAllGuidesForSection(roomId, sectionId, videoFileName) {
        console.log(`👥 Precargando "${videoFileName}" para todas las guías en ${roomId}/${sectionId}...`);
        
        this.guides.forEach((guide, index) => {
            const videoPath = `/habitaciones/${roomId}/${sectionId}/videos/${guide}/${videoFileName}`;
            
            // Retraso progresivo
            setTimeout(() => {
                this.preloadVideo(videoPath, 'low');
            }, index * 300);
        });
    }

    // Información de estado para debugging
    getStatus() {
        return {
            currentGuide: this.currentGuide,
            availableGuides: this.guides,
            preloadedCount: this.preloadedVideos.size,
            cachedCount: this.videoCache.size,
            currentRoom: this.currentRoom,
            currentSection: this.currentSection,
            preloadedVideos: Array.from(this.preloadedVideos).map(url => ({
                guide: this.extractGuideFromPath(url),
                file: url.split('/').pop()
            }))
        };
    }

    // Extraer guía de una ruta
    extractGuideFromPath(path) {
        const parts = path.split('/');
        const videosIndex = parts.indexOf('videos');
        return videosIndex >= 0 ? parts[videosIndex + 1] : 'unknown';
    }

    // Actualizar configuración de habitaciones dinámicamente
    updateRoomStructure(roomId, sections, videosPerSection) {
        this.roomStructure[roomId] = {
            sections,
            videosPerSection
        };
        console.log(`📝 Configuración actualizada para ${roomId}`);
    }
}

// Crear instancia global del preloader
const videoPreloader = new VideoPreloader();

// Funciones de integración con tu aplicación
function integrateWithExistingNavigation() {
    
    // Cambiar guía (llamar cuando el usuario seleccione una nueva guía)
    window.changeGuide = function(guideName) {
        if (videoPreloader.setGuide(guideName)) {
            console.log(`✅ Guía cambiada a: ${guideName}`);
            
            // Reprecargar habitación actual con nueva guía
            if (videoPreloader.currentRoom) {
                videoPreloader.preloadRoomVideos(videoPreloader.currentRoom);
            }
            
            return true;
        }
        return false;
    };

    // Navegación a habitación
    window.navigateToRoom = function(roomId) {
        console.log(`🏠 Navegando a ${roomId} con guía: ${videoPreloader.currentGuide}`);
        videoPreloader.onNavigateToRoom(roomId);
    };
    
    // Navegación a sección
    window.navigateToSection = function(roomId, sectionId) {
        console.log(`📍 Navegando a ${roomId}/${sectionId} con guía: ${videoPreloader.currentGuide}`);
        videoPreloader.onNavigateToSection(roomId, sectionId);
    };
    
    // Reproducir video (función principal para usar en tu código)
    window.playMuseumVideo = async function(roomId, sectionId, videoFileName, videoElementId = 'museum-video') {
        const videoElement = document.getElementById(videoElementId);
        
        try {
            await videoPreloader.playVideo(roomId, sectionId, videoFileName, videoElement);
            console.log(`▶️ Reproduciendo: ${videoFileName} (${videoPreloader.currentGuide})`);
        } catch (error) {
            console.error('Error reproduciendo video:', error);
        }
    };

    // Precargar videos para cambio rápido de guía
    window.preloadForGuideSwitch = function(roomId, sectionId, videoFileName) {
        videoPreloader.preloadAllGuidesForSection(roomId, sectionId, videoFileName);
    };
    
    // Debug y utilidades
    window.showPreloaderStatus = function() {
        console.log('📊 Estado del Preloader:', videoPreloader.getStatus());
    };

    window.getAvailableGuides = function() {
        return videoPreloader.guides;
    };

    window.getCurrentGuide = function() {
        return videoPreloader.currentGuide;
    };
}

// Selector de guía UI (opcional)
function createGuideSelector() {
    const selector = document.createElement('select');
    selector.id = 'guide-selector';
    selector.style.position = 'fixed';
    selector.style.top = '10px';
    selector.style.right = '10px';
    selector.style.zIndex = '1000';
    selector.style.padding = '5px';
    selector.style.fontSize = '14px';

    // Agregar opciones de guías
    videoPreloader.guides.forEach(guide => {
        const option = document.createElement('option');
        option.value = guide;
        option.textContent = guide.charAt(0).toUpperCase() + guide.slice(1);
        if (guide === videoPreloader.currentGuide) {
            option.selected = true;
        }
        selector.appendChild(option);
    });

    // Event listener para cambio de guía
    selector.addEventListener('change', (e) => {
        changeGuide(e.target.value);
    });

    return selector;
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    integrateWithExistingNavigation();
    
    // Crear selector de guía (opcional - quitar si no lo necesitas)
    // document.body.appendChild(createGuideSelector());
    
    // Precargar habitación inicial con guía por defecto
    videoPreloader.preloadRoomVideos('habitacion_1');
    
    console.log(`🚢 Sistema de precarga iniciado con guía: ${videoPreloader.currentGuide}`);
    console.log(`👥 Guías disponibles:`, videoPreloader.guides);
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoPreloader;
}
