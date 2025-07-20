class AnimalPuzzleGame {
    constructor() {
        this.score = 0;
        this.puzzleGrid = [];
        this.availableBlocks = [];
        this.targetPattern = [];
        this.currentAnimal = null;
        this.animalData = this.createAnimalData();
        this.init();
    }

    createAnimalData() {
        return {
            cat: {
                name: 'ねこ',
                emoji: '🐱',
                colors: [
                    ['#F4A460', '#DEB887', '#DEB887', '#F4A460'],
                    ['#000000', '#F4A460', '#F4A460', '#000000'],
                    ['#F4A460', '#FF69B4', '#FF69B4', '#F4A460'],
                    ['#F4A460', '#F4A460', '#F4A460', '#F4A460']
                ]
            },
            dog: {
                name: 'いぬ',
                emoji: '🐶',
                colors: [
                    ['#D2691E', '#F4A460', '#F4A460', '#D2691E'],
                    ['#000000', '#F4A460', '#F4A460', '#000000'],
                    ['#F4A460', '#000000', '#000000', '#F4A460'],
                    ['#F4A460', '#FF6B6B', '#FF6B6B', '#F4A460']
                ]
            },
            rabbit: {
                name: 'うさぎ',
                emoji: '🐰',
                colors: [
                    ['#FFFFFF', '#FFB6C1', '#FFB6C1', '#FFFFFF'],
                    ['#000000', '#FFFFFF', '#FFFFFF', '#000000'],
                    ['#FFFFFF', '#FF69B4', '#FF69B4', '#FFFFFF'],
                    ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF']
                ]
            },
            elephant: {
                name: 'ぞう',
                emoji: '🐘',
                colors: [
                    ['#808080', '#808080', '#808080', '#808080'],
                    ['#000000', '#808080', '#808080', '#000000'],
                    ['#808080', '#808080', '#808080', '#808080'],
                    ['#808080', '#808080', '#808080', '#808080']
                ]
            }
        };
    }

    init() {
        this.createPuzzleGrid();
        this.generateTargetPattern();
        this.createAvailableBlocks();
        this.setupEventListeners();
        this.updateScore();
    }

    createPuzzleGrid() {
        const puzzleGrid = document.getElementById('puzzle-grid');
        puzzleGrid.innerHTML = '';
        this.puzzleGrid = [];

        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.index = i;
            cell.addEventListener('dragover', this.handleDragOver.bind(this));
            cell.addEventListener('drop', this.handleDrop.bind(this));
            cell.addEventListener('dragleave', this.handleDragLeave.bind(this));
            puzzleGrid.appendChild(cell);
            this.puzzleGrid.push(null);
        }
    }

    generateTargetPattern() {
        const animalKeys = Object.keys(this.animalData);
        const randomAnimal = animalKeys[Math.floor(Math.random() * animalKeys.length)];
        this.currentAnimal = this.animalData[randomAnimal];
        
        this.targetPattern = [];
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const index = row * 4 + col;
                this.targetPattern[index] = this.currentAnimal.colors[row][col];
            }
        }
    }

    createAvailableBlocks() {
        const blocksContainer = document.getElementById('available-blocks');
        blocksContainer.innerHTML = '';
        this.availableBlocks = [];

        const targetBlocks = [...this.targetPattern];
        const extraBlocks = [];
        
        targetBlocks.forEach(color => {
            extraBlocks.push(color);
        });
        
        const numExtraBlocks = 3 + Math.floor(Math.random() * 3);
        const otherAnimals = Object.values(this.animalData).filter(animal => animal !== this.currentAnimal);
        
        for (let i = 0; i < numExtraBlocks; i++) {
            const randomAnimal = otherAnimals[Math.floor(Math.random() * otherAnimals.length)];
            const randomRow = Math.floor(Math.random() * 4);
            const randomCol = Math.floor(Math.random() * 4);
            const randomColor = randomAnimal.colors[randomRow][randomCol];
            extraBlocks.push(randomColor);
        }

        this.shuffleArray(extraBlocks);

        extraBlocks.forEach((color, index) => {
            const block = document.createElement('div');
            block.className = 'puzzle-piece';
            block.draggable = true;
            block.dataset.color = color;
            block.dataset.blockId = index;
            block.style.backgroundColor = color;
            
            block.addEventListener('dragstart', this.handleDragStart.bind(this));
            block.addEventListener('dragend', this.handleDragEnd.bind(this));
            
            block.addEventListener('touchstart', this.handleTouchStart.bind(this));
            block.addEventListener('touchmove', this.handleTouchMove.bind(this));
            block.addEventListener('touchend', this.handleTouchEnd.bind(this));
            
            blocksContainer.appendChild(block);
            this.availableBlocks.push(block);
        });
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.blockId);
        e.target.classList.add('dragging');
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    handleDragOver(e) {
        e.preventDefault();
        if (!e.target.classList.contains('occupied')) {
            e.target.classList.add('drop-zone');
        }
    }

    handleDragLeave(e) {
        e.target.classList.remove('drop-zone');
    }

    handleDrop(e) {
        e.preventDefault();
        e.target.classList.remove('drop-zone');
        
        if (e.target.classList.contains('occupied')) {
            return;
        }

        const blockId = e.dataTransfer.getData('text/plain');
        const draggedBlock = this.availableBlocks.find(block => 
            block.dataset.blockId === blockId
        );

        if (draggedBlock) {
            this.placeBlock(draggedBlock, parseInt(e.target.dataset.index));
        }
    }

    handleTouchStart(e) {
        e.preventDefault();
        this.touchStartPos = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
        this.draggedTouchBlock = e.target;
        e.target.classList.add('dragging');
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (this.draggedTouchBlock) {
            const touch = e.touches[0];
            this.draggedTouchBlock.style.position = 'fixed';
            this.draggedTouchBlock.style.left = touch.clientX - 30 + 'px';
            this.draggedTouchBlock.style.top = touch.clientY - 30 + 'px';
            this.draggedTouchBlock.style.zIndex = '1000';
        }
    }

    handleTouchEnd(e) {
        e.preventDefault();
        if (this.draggedTouchBlock) {
            const touch = e.changedTouches[0];
            const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
            
            if (elementBelow && elementBelow.classList.contains('grid-cell') && 
                !elementBelow.classList.contains('occupied')) {
                this.placeBlock(this.draggedTouchBlock, parseInt(elementBelow.dataset.index));
            }
            
            this.draggedTouchBlock.style.position = '';
            this.draggedTouchBlock.style.left = '';
            this.draggedTouchBlock.style.top = '';
            this.draggedTouchBlock.style.zIndex = '';
            this.draggedTouchBlock.classList.remove('dragging');
            this.draggedTouchBlock = null;
        }
    }

    placeBlock(block, gridIndex) {
        const gridCell = document.querySelector(`[data-index="${gridIndex}"]`);
        const newBlock = block.cloneNode(true);
        
        newBlock.draggable = false;
        newBlock.style.width = '100%';
        newBlock.style.height = '100%';
        newBlock.style.cursor = 'pointer';
        newBlock.style.backgroundColor = block.dataset.color;
        
        newBlock.addEventListener('click', () => {
            this.removeBlock(gridIndex);
        });
        
        gridCell.appendChild(newBlock);
        gridCell.classList.add('occupied');
        this.puzzleGrid[gridIndex] = block.dataset.color;
        
        block.remove();
        this.availableBlocks = this.availableBlocks.filter(b => b !== block);
        
        this.checkCompletion();
        this.playPlaceSound();
    }

    removeBlock(gridIndex) {
        const gridCell = document.querySelector(`[data-index="${gridIndex}"]`);
        const blockInCell = gridCell.querySelector('.puzzle-piece');
        
        if (blockInCell) {
            const color = this.puzzleGrid[gridIndex];
            
            const blocksContainer = document.getElementById('available-blocks');
            const restoredBlock = document.createElement('div');
            restoredBlock.className = 'puzzle-piece';
            restoredBlock.draggable = true;
            restoredBlock.dataset.color = color;
            restoredBlock.dataset.blockId = Date.now();
            restoredBlock.style.backgroundColor = color;
            
            restoredBlock.addEventListener('dragstart', this.handleDragStart.bind(this));
            restoredBlock.addEventListener('dragend', this.handleDragEnd.bind(this));
            restoredBlock.addEventListener('touchstart', this.handleTouchStart.bind(this));
            restoredBlock.addEventListener('touchmove', this.handleTouchMove.bind(this));
            restoredBlock.addEventListener('touchend', this.handleTouchEnd.bind(this));
            
            blocksContainer.appendChild(restoredBlock);
            this.availableBlocks.push(restoredBlock);
            
            gridCell.removeChild(blockInCell);
            gridCell.classList.remove('occupied');
            this.puzzleGrid[gridIndex] = null;
        }
    }

    checkCompletion() {
        let isComplete = true;
        
        for (let i = 0; i < 16; i++) {
            if (this.targetPattern[i] !== undefined) {
                if (this.puzzleGrid[i] !== this.targetPattern[i]) {
                    isComplete = false;
                    break;
                }
            } else {
                if (this.puzzleGrid[i] !== null) {
                    isComplete = false;
                    break;
                }
            }
        }
        
        if (isComplete) {
            this.handleSuccess();
        }
    }

    handleSuccess() {
        this.score += 100;
        this.updateScore();
        this.showSuccessMessage();
        this.playSuccessSound();
        
        this.showCompletedAnimal();
        
        setTimeout(() => {
            this.newGame();
        }, 5000);
    }

    showSuccessMessage() {
        const successMessage = document.getElementById('success-message');
        const animalName = this.currentAnimal.name;
        const animalEmoji = this.currentAnimal.emoji;
        
        successMessage.querySelector('h2').textContent = `🎉 ${animalEmoji} ${animalName}の完成！ 🎉`;
        successMessage.querySelector('p').textContent = `${animalName}のパズルをかんせいできました！`;
        successMessage.classList.remove('hidden');
        
        document.querySelector('.puzzle-grid').classList.add('celebrate');
        
        setTimeout(() => {
            successMessage.classList.add('hidden');
            document.querySelector('.puzzle-grid').classList.remove('celebrate');
        }, 5000);
    }

    showCompletedAnimal() {
        const puzzleGrid = document.querySelector('.puzzle-grid');
        puzzleGrid.style.position = 'relative';
        
        const animalOverlay = document.createElement('div');
        animalOverlay.className = 'animal-overlay';
        animalOverlay.textContent = this.currentAnimal.emoji;
        animalOverlay.style.position = 'absolute';
        animalOverlay.style.top = '0';
        animalOverlay.style.left = '0';
        animalOverlay.style.width = '100%';
        animalOverlay.style.height = '100%';
        animalOverlay.style.display = 'flex';
        animalOverlay.style.alignItems = 'center';
        animalOverlay.style.justifyContent = 'center';
        animalOverlay.style.fontSize = '120px';
        animalOverlay.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        animalOverlay.style.borderRadius = '15px';
        animalOverlay.style.zIndex = '10';
        animalOverlay.style.animation = 'fadeIn 1s ease-in-out';
        
        puzzleGrid.appendChild(animalOverlay);
        
        setTimeout(() => {
            if (animalOverlay.parentNode) {
                animalOverlay.parentNode.removeChild(animalOverlay);
            }
        }, 5000);
    }

    playPlaceSound() {
        if (this.audioContext) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        }
    }

    playSuccessSound() {
        if (this.audioContext) {
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.3);
                }, index * 100);
            });
        }
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
    }

    newGame() {
        document.getElementById('success-message').classList.add('hidden');
        this.generateTargetPattern();
        this.createPuzzleGrid();
        this.createAvailableBlocks();
    }

    setupEventListeners() {
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.newGame();
        });
        
        document.addEventListener('click', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        }, { once: true });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AnimalPuzzleGame();
});