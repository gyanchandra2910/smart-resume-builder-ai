/**
 * Voice-Driven Resume Editor - Simplified and Reliable Version
 * Uses Web Speech API to allow voice commands for editing resume
 */

console.log('🎙️ VoiceEditor script starting...');

// Immediately create a simple VoiceEditor object
window.VoiceEditor = {
    // State variables
    recognition: null,
    isListening: false,
    isInitialized: false,
    
    // Initialize the voice editor
    init: function() {
        console.log('🚀 VoiceEditor.init() called');
        
        try {
            // Check browser support
            if (!this.checkBrowserSupport()) {
                console.log('❌ Browser not supported');
                this.showUnsupportedBrowserWarning();
                return false;
            }
            
            console.log('✅ Browser supports Web Speech API');
            this.setupUI();
            this.setupSpeechRecognition();
            this.setupEventListeners();
            this.isInitialized = true;
            console.log('✅ Voice Editor initialized successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Error initializing VoiceEditor:', error);
            this.showErrorMessage('Initialization failed: ' + error.message);
            return false;
        }
    },
    
    // Check browser support
    checkBrowserSupport: function() {
        return ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
    },
    
    // Setup UI
    setupUI: function() {
        console.log('🎨 Setting up Voice Editor UI...');
        
        // Find target container
        const voiceSection = document.getElementById('voiceEditorSection');
        if (!voiceSection) {
            console.error('❌ voiceEditorSection not found');
            return;
        }
        
        // Create UI
        voiceSection.innerHTML = `
            <div class="voice-editor-container" style="
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border: 2px solid #007bff;
                border-radius: 15px;
                padding: 20px;
                margin: 10px 0;
                color: #333;
                box-shadow: 0 4px 15px rgba(0,123,255,0.15);
            ">
                <div class="voice-editor-header text-center mb-3">
                    <h5 class="mb-2" style="color: #007bff; font-weight: 600;">
                        <i class="fas fa-microphone-alt me-2"></i>
                        Voice-Driven Resume Editor
                    </h5>
                    <p class="text-muted mb-0">
                        <small>✨ Edit your resume hands-free using voice commands</small>
                    </p>
                </div>
                <div class="voice-controls text-center">
                    <button id="voiceStartBtn" class="btn btn-primary me-2" style="min-width: 150px;">
                        <i class="fas fa-microphone me-2"></i>
                        Start Voice Editing
                    </button>
                    <button id="voiceStopBtn" class="btn btn-danger me-2" style="display: none; min-width: 150px;">
                        <i class="fas fa-stop me-2"></i>
                        Stop Listening
                    </button>
                    <button class="btn btn-outline-info btn-sm" onclick="VoiceEditor.showHelp()">
                        <i class="fas fa-question-circle me-1"></i>Help
                    </button>
                    <button class="btn btn-outline-success btn-sm ms-1" onclick="VoiceEditor.testCommand()">
                        <i class="fas fa-flask me-1"></i>Test
                    </button>
                </div>
                <div id="voiceStatus" class="text-center mt-3">
                    <span class="badge bg-secondary">Ready to listen</span>
                </div>
                <div id="commandDisplay" class="mt-3" style="display: none;">
                    <div class="alert alert-info">
                        <strong>Listening:</strong> <span id="commandText"></span>
                    </div>
                </div>
            </div>
        `;
        
        console.log('✅ Voice Editor UI created');
    },
    
    // Setup speech recognition
    setupSpeechRecognition: function() {
        console.log('🎤 Setting up speech recognition...');
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        
        const self = this;
        
        this.recognition.onstart = function() {
            console.log('🎤 Voice recognition started');
            self.updateStatus('Listening...', 'success');
        };
        
        this.recognition.onresult = function(event) {
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    self.displayCommand(transcript);
                }
            }
            
            if (finalTranscript) {
                console.log('🎯 Final transcript:', finalTranscript);
                self.handleVoiceCommand(finalTranscript.trim());
            }
        };
        
        this.recognition.onerror = function(event) {
            console.error('❌ Speech recognition error:', event.error);
            self.showAlert('Voice recognition error: ' + event.error, 'danger');
            self.stopListening();
        };
        
        this.recognition.onend = function() {
            console.log('🎤 Voice recognition ended');
            if (self.isListening) {
                try {
                    self.recognition.start();
                } catch (error) {
                    console.error('Error restarting recognition:', error);
                    self.stopListening();
                }
            }
        };
        
        console.log('✅ Speech recognition setup complete');
    },
    
    // Setup event listeners
    setupEventListeners: function() {
        const startBtn = document.getElementById('voiceStartBtn');
        const stopBtn = document.getElementById('voiceStopBtn');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startListening());
        }
        
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopListening());
        }
        
        console.log('✅ Event listeners setup complete');
    },
    
    // Start listening
    startListening: function() {
        if (!this.recognition) {
            this.showAlert('Speech recognition not available', 'danger');
            return;
        }
        
        if (this.isListening) {
            this.showAlert('Already listening', 'info');
            return;
        }
        
        try {
            this.isListening = true;
            this.recognition.start();
            this.updateUI(true);
            this.showAlert('🎙️ Voice editing started! Try: "Update my name to John Smith"', 'success');
        } catch (error) {
            console.error('Error starting recognition:', error);
            this.showAlert('Failed to start voice recognition', 'danger');
            this.isListening = false;
        }
    },
    
    // Stop listening
    stopListening: function() {
        this.isListening = false;
        if (this.recognition) {
            this.recognition.stop();
        }
        this.updateUI(false);
        this.hideCommand();
        this.showAlert('🛑 Voice editing stopped', 'info');
    },
    
    // Handle voice commands
    handleVoiceCommand: function(command) {
        console.log('🎯 Processing command:', command);
        
        const lowerCommand = command.toLowerCase().trim();
        let success = false;
        
        // Stop commands
        if (lowerCommand.includes('stop') || lowerCommand.includes('done')) {
            this.stopListening();
            return;
        }
        
        // Help commands
        if (lowerCommand.includes('help')) {
            this.showHelp();
            return;
        }
        
        // Name update
        if (lowerCommand.match(/(?:update|change|set).+name.+to\s+(.+)/i)) {
            const match = command.match(/(?:update|change|set).+name.+to\s+(.+)/i);
            if (match) {
                success = this.updateField('fullName', match[1].trim());
            }
        }
        // Email update
        else if (lowerCommand.match(/(?:update|change|set).+email.+to\s+(.+)/i)) {
            const match = command.match(/(?:update|change|set).+email.+to\s+(.+)/i);
            if (match) {
                success = this.updateField('email', match[1].trim());
            }
        }
        // Phone update
        else if (lowerCommand.match(/(?:update|change|set).+phone.+to\s+(.+)/i)) {
            const match = command.match(/(?:update|change|set).+phone.+to\s+(.+)/i);
            if (match) {
                let phone = match[1].trim();
                phone = this.convertSpokenNumbers(phone);
                success = this.updateField('phone', phone);
            }
        }
        // Add skill
        else if (lowerCommand.match(/add skill\s+(.+)/i)) {
            const match = command.match(/add skill\s+(.+)/i);
            if (match) {
                success = this.addSkill(match[1].trim());
            }
        }
        // Update objective
        else if (lowerCommand.match(/(?:update|change|set).+objective.+to\s+(.+)/i)) {
            const match = command.match(/(?:update|change|set).+objective.+to\s+(.+)/i);
            if (match) {
                success = this.updateField('careerObjective', match[1].trim());
            }
        }
        
        if (success) {
            this.showAlert('✅ Command executed successfully!', 'success');
        } else {
            this.showAlert('❌ Command not recognized. Say "help" for examples.', 'warning');
        }
    },
    
    // Update a form field
    updateField: function(fieldId, value) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = value;
            field.dispatchEvent(new Event('input', { bubbles: true }));
            field.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`✅ Updated ${fieldId} to: ${value}`);
            return true;
        }
        console.log(`❌ Field ${fieldId} not found`);
        return false;
    },
    
    // Add skill
    addSkill: function(skill) {
        const skillsField = document.getElementById('keySkills');
        if (skillsField) {
            skillsField.value = skill;
            skillsField.focus();
            
            // Simulate Enter key press
            const enterEvent = new KeyboardEvent('keypress', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true
            });
            skillsField.dispatchEvent(enterEvent);
            
            // Also try blur event
            skillsField.dispatchEvent(new Event('blur', { bubbles: true }));
            
            setTimeout(() => {
                skillsField.value = '';
            }, 100);
            
            console.log(`✅ Added skill: ${skill}`);
            return true;
        }
        console.log('❌ Skills field not found');
        return false;
    },
    
    // Convert spoken numbers to digits
    convertSpokenNumbers: function(text) {
        const numberMap = {
            'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
            'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
            'oh': '0'
        };
        
        let result = text;
        for (const [word, digit] of Object.entries(numberMap)) {
            const regex = new RegExp('\\b' + word + '\\b', 'gi');
            result = result.replace(regex, digit);
        }
        
        return result.replace(/\s+/g, ' ').trim();
    },
    
    // Update UI state
    updateUI: function(listening) {
        const startBtn = document.getElementById('voiceStartBtn');
        const stopBtn = document.getElementById('voiceStopBtn');
        
        if (startBtn) startBtn.style.display = listening ? 'none' : 'inline-block';
        if (stopBtn) stopBtn.style.display = listening ? 'inline-block' : 'none';
    },
    
    // Update status
    updateStatus: function(text, type = 'secondary') {
        const status = document.getElementById('voiceStatus');
        if (status) {
            status.innerHTML = `<span class="badge bg-${type}">${text}</span>`;
        }
    },
    
    // Display command
    displayCommand: function(command) {
        const display = document.getElementById('commandDisplay');
        const text = document.getElementById('commandText');
        if (display && text) {
            text.textContent = command;
            display.style.display = 'block';
        }
    },
    
    // Hide command display
    hideCommand: function() {
        const display = document.getElementById('commandDisplay');
        if (display) {
            display.style.display = 'none';
        }
    },
    
    // Show alert
    showAlert: function(message, type = 'info') {
        // Create alert element
        let alert = document.getElementById('voiceAlert');
        if (!alert) {
            alert = document.createElement('div');
            alert.id = 'voiceAlert';
            alert.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 350px;';
            document.body.appendChild(alert);
        }
        
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
        `;
        
        // Auto dismiss
        setTimeout(() => {
            if (alert && alert.parentElement) {
                alert.remove();
            }
        }, 4000);
    },
    
    // Show help
    showHelp: function() {
        const helpContent = `
            <h6><i class="fas fa-microphone me-2"></i>Voice Commands Help</h6>
            <p><strong>Examples:</strong></p>
            <ul>
                <li>"Update my name to John Smith"</li>
                <li>"Change email to john@example.com"</li>
                <li>"Set phone to 555-123-4567"</li>
                <li>"Add skill JavaScript"</li>
                <li>"Update my objective to seeking new opportunities"</li>
                <li>"Stop listening" or "Done"</li>
            </ul>
            <small><i class="fas fa-info-circle me-1"></i>Speak clearly and naturally.</small>
        `;
        this.showAlert(helpContent, 'info');
    },
    
    // Test command (for debugging)
    testCommand: function() {
        const testCommands = [
            'Update my name to John Doe',
            'Change email to john.doe@example.com',
            'Set phone to 555-123-4567',
            'Add skill JavaScript'
        ];
        
        const randomCommand = testCommands[Math.floor(Math.random() * testCommands.length)];
        this.showAlert(`🧪 Testing: "${randomCommand}"`, 'info');
        this.handleVoiceCommand(randomCommand);
    },
    
    // Show error message
    showErrorMessage: function(message) {
        const voiceSection = document.getElementById('voiceEditorSection');
        if (voiceSection) {
            voiceSection.innerHTML = `
                <div class="alert alert-danger text-center">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>Voice Editor Error:</strong> ${message}
                    <br><small class="mt-2 d-block">
                        <button class="btn btn-sm btn-outline-primary mt-2" onclick="location.reload()">
                            <i class="fas fa-sync-alt me-1"></i>Refresh Page
                        </button>
                    </small>
                </div>
            `;
        }
    },
    
    // Show unsupported browser warning
    showUnsupportedBrowserWarning: function() {
        this.showErrorMessage('Voice editing requires Chrome browser. Web Speech API not supported.');
    }
};

// Immediate availability check
console.log('✅ VoiceEditor object created');
console.log('📦 VoiceEditor type:', typeof window.VoiceEditor);
console.log('🔍 VoiceEditor.init type:', typeof window.VoiceEditor.init);

// Legacy support
window.initVoiceEditor = function() {
    return window.VoiceEditor.init();
};

window.testVoiceCommand = function() {
    return window.VoiceEditor.testCommand();
};

console.log('✅ VoiceEditor script loaded and ready');
