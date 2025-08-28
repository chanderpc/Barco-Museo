// DETECTOR AUTOMÁTICO DE ESTRUCTURA - Para mapear qué videos realmente existen
class VideoStructureDetector {
    constructor() {
        this.roomStructure = new Map();
        this.isScanning = false;
    }

    // ESCANEAR TODA UNA HABITACIÓN
    async scanRoom(roomId) {
        if (this.isScanning) {
            console.log('Ya hay un escaneo en curso...');
            return this.roomStructure.get(roomId) || {};
        }

        this.isScanning = true;
        console.log(`🔍 Escaneando estructura completa de ${roomId}...`);

        const roomData = {};
        const maxSections = this.getMaxSectionsForRoom(roomId);

        for (let sectionNum = 1; sectionNum <= maxSections; sectionNum++) {
            const sectionId = `seccion_${sectionNum}`;
            console.log(`📂 Escaneando ${sectionId}...`);
            
            try {
                const sectionVideos = await this.scanSectionVideos(roomId, sectionId);
                if (sectionVideos.length > 0) {
                    roomData[sectionId] = sectionVideos;
                }
            } catch (error) {
                console.warn(`Error escaneando ${sectionId}:`, error);
            }

            // Pequeña pausa para no saturar el servidor
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        this.roomStructure.set(roomId, roomData);
        this.isScanning = false;

        console.log(`✅ Estructura de ${roomId} completada:`, roomData);
        return roomData;
    }

    // ESCANEAR VIDEOS DE UNA SECCIÓN ESPECÍFICA
    async scanSectionVideos(roomId, sectionId) {
        const guide = smartPreloader.guideMapping[smartPreloader.currentGuide] || 'andrea';
        const basePath = `habitaciones/${roomId}/${sectionId}/videos/${guide}`;
        const existingVideos = [];

        // Verificar video principal
        const mainVideo = 'video1.mp4';
        if (await this.checkVideoExists(`${basePath}/${mainVideo}`)) {
            existingVideos.push(mainVideo);
        }

        // Verificar subvideos
        for (let i = 1; i <= 20; i++) { // Buscar hasta sub20
            const subVideo = `video1_sub${i}.mp4`;
            const exists = await this.checkVideoExists(`${basePath}/${subVideo}`);
            
            if (exists) {
                existingVideos.push(subVideo);
            } else {
                // Si sub1 no existe, parar
                if (i === 1) break;
            }
        }

        return existingVideos;
    }

    // VERIFICAR EXISTENCIA DE UN VIDEO ESPECÍFICO
    async checkVideoExists(videoURL) {
        try {
            const response = await fetch(videoURL, { 
                method: 'HEAD',
                cache: 'no-store'
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    // OBTENER MÁXIMO DE SECCIONES POR HABITACIÓN
    getMaxSectionsForRoom(roomId) {
        const maxSections = {
            'habitacion_1': 16,
            'habitacion_2': 18,
            'habitacion_3': 9,
            'habitacion_4': 20,
            'habitacion_5': 3,
            'habitacion_6': 1
        };
        return maxSections[roomId] || 10;
    }

    // OBTENER ESTRUCTURA GUARDADA
    getRoomStructure(roomId) {
        return this.roomStructure.get(roomId) || null;
    }

    // OBTENER VIDEOS DE UNA SECCIÓN
    getSectionVideos(roomId, sectionId) {
        const roomData = this.roomStructure.get(roomId);
        return roomData ? (roomData[sectionId] || []) : [];
    }

    // GENERAR CONFIGURACIÓN PARA EL PRELOADER
    generatePreloaderConfig() {
        const config = {};
        
        for (const [roomId, roomData] of this.roomStructure.entries()) {
            config[roomId] = {
                totalSections: Object.keys(roomData).length,
                sections: {}
            };
            
            for (const [sectionId, videos] of Object.entries(roomData)) {
                config[roomId].sections[sectionId] = videos;
            }
        }

        return config;
    }

    // LIMPIAR ESTRUCTURA
    clearStructure() {
        this.roomStructure.clear();
    }

    // ESTADÍSTICAS
    getStats() {
        const stats = {};
        for (const [roomId, roomData] of this.roomStructure.entries()) {
            stats[roomId] = {};
            for (const [sectionId, videos] of Object.entries(roomData)) {
                stats[roomId][sectionId] = videos.length;
            }
        }
        return stats;
    }
}

// INTEGRACIÓN CON EL PRELOADER INTELIGENTE
class EnhancedSmartPreloader extends SmartVideoPreloader {
    constructor() {
        super();
        this.structureDetector = new VideoStructureDetector();
        this.autoScanEnabled = true;
    }

    // PRECARGA MEJORADA QUE USA LA ESTRUCTURA DETECTADA
    async preloadSection(roomId, sectionId) {
        console.log(`🚀 Precarga con estructura: ${roomId}/${sectionId}`);
        
        // Verificar si tenemos la estructura escaneada
        let sectionVideos = this.structureDetector.getSectionVideos(roomId, sectionId);
        
        if (sectionVideos.length === 0 && this.autoScanEnabled) {
            console.log(`📡 Auto-escaneando ${sectionId}...`);
            sectionVideos = await this.structureDetector.scanSectionVideos(roomId, sectionId);
        }

        if (sectionVideos.length === 0) {
            console.warn(`❌ No se encontraron videos en ${roomId}/${sectionId}`);
            return;
        }

        console.log(`📋 Videos a precargar:`, sectionVideos);

        // Precargar solo videos confirmados
        const preloadPromises = sectionVideos.map((videoName, index) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    this.getVideo(roomId, sectionId, videoName)
                        .then(resolve)
                        .catch(err => {
                            console.warn(`Falló precarga ${videoName}:`, err);
                            resolve(null);
                        });
                }, index * 250);
            });
        });

        return Promise.allSettled(preloadPromises);
    }

    // ESCANEO AUTOMÁTICO AL NAVEGAR
    async navigateToRoom(roomId) {
        if (this.autoScanEnabled) {
            // Escanear habitación en background
            setTimeout(() => {
                this.structureDetector.scanRoom(roomId)
                    .catch(err => console.warn('Error en auto-escaneo:', err));
            }, 2000);
        }
    }

    // OBTENER ESTADÍSTICAS COMPLETAS
    getFullStats() {
        return {
            preloader: super.getStats(),
            structure: this.structureDetector.getStats(),
            autoScanEnabled: this.autoScanEnabled
        };
    }
}

// FUNCIÓN DE REPRODUCCIÓN QUE VERIFICA ESTRUCTURA
async function reproducirAudioConEstructura(button) {
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

    console.log(`🎬 Reproduciendo con estructura: ${audioName}`);

    // VERIFICAR SI EL VIDEO ESTÁ EN LA ESTRUCTURA CONOCIDA
    const sectionVideos = enhancedPreloader.structureDetector.getSectionVideos(currentRoom, currentSection);
    const videoExists = sectionVideos.includes(audioName);

    if (!videoExists && sectionVideos.length > 0) {
        console.warn(`⚠️ Video ${audioName} no está en la estructura conocida de ${currentSection}`);
        console.log(`📋 Videos disponibles:`, sectionVideos);
        
        // Mostrar solo avatar y texto
        showAvatarOnly();
        loadSubtitles(currentRoom, currentSection, audioName);
        return;
    }

    // Continuar con reproducción normal si el video existe
    const loader = document.getElementById("avatar-loader");
    const avatar = document.getElementById("avatar");
    const video = document.getElementById("aiko-video");

    if (avatar) avatar.classList.add("hidden");
    if (video) video.classList.remove("playing");
    if (loader) loader.classList.remove("hidden");

    try {
        const blobURL = await enhancedPreloader.getVideo(currentRoom, currentSection, audioName);

        if (blobURL && video) {
            if (video.src !== blobURL) {
                video.src = blobURL;
                video.load();
            }
            
            video.currentTime = 0;
            await playVideoSafely(video);
            
            video.onended = () => {
                video.classList.remove("playing");
                if (avatar) avatar.classList.remove("hidden");
            };
        } else {
            throw new Error(`Video no disponible: ${audioName}`);
        }

    } catch (error) {
        console.warn(`⚠️ Error reproduciendo ${audioName}:`, error);
        showAvatarOnly();
    }

    loadSubtitles(currentRoom, currentSection, audioName);
}

// FUNCIONES AUXILIARES
function showAvatarOnly() {
    const loader = document.getElementById("avatar-loader");
    const avatar = document.getElementById("avatar");
    const video = document.getElementById("aiko-video");
    
    if (loader) loader.classList.add("hidden");
    if (avatar) avatar.classList.remove("hidden");
    if (video) video.classList.remove("playing");
}

async function playVideoSafely(video) {
    return new Promise((resolve, reject) => {
        let resolved = false;
        
        const cleanup = () => {
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('error', handleError);
        };

        const handleCanPlay = () => {
            if (resolved) return;
            resolved = true;
            cleanup();
            
            const loader = document.getElementById("avatar-loader");
            if (loader) loader.classList.add("hidden");
            video.classList.add("playing");
            
            video.play().then(resolve).catch(reject);
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
        }, 2500);
    });
}

// INSTANCIA GLOBAL MEJORADA
const enhancedPreloader = new EnhancedSmartPreloader();

// REEMPLAZAR FUNCIONES GLOBALES
window.reproducirAudio = reproducirAudioConEstructura;
window.videoPreloader = enhancedPreloader;

window.navigateToRoom = function(roomId) {
    enhancedPreloader.navigateToRoom(roomId);
};

window.navigateToSection = function(roomId, sectionId) {
    setTimeout(() => {
        enhancedPreloader.preloadSection(roomId, sectionId);
    }, 800);
};

window.changeGuide = function(guideName) {
    enhancedPreloader.changeGuide(guideName);
};

// COMANDOS DE DEBUG
window.scanCurrentRoom = function() {
    const roomId = window.habitacionActual || 'habitacion_1';
    return enhancedPreloader.structureDetector.scanRoom(roomId);
};

window.showEnhancedStats = function() {
    console.log('📊 Stats completas:', enhancedPreloader.getFullStats());
};

window.showRoomStructure = function(roomId) {
    const structure = enhancedPreloader.structureDetector.getRoomStructure(roomId);
    console.log(`🏠 Estructura de ${roomId}:`, structure);
    return structure;
};

console.log('🔍 Sistema con detección de estructura inicializado');