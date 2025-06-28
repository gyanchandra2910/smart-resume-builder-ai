// Voice Editor Integration Test
// Run this in browser console to verify voice editor functionality

function testVoiceEditorIntegration() {
    console.log('🎙️ Testing Voice Editor Integration...');
    
    // Test 1: Check if VoiceEditor class is available
    if (typeof VoiceEditor !== 'undefined') {
        console.log('✅ VoiceEditor class loaded successfully');
    } else {
        console.error('❌ VoiceEditor class not found');
        return;
    }
    
    // Test 2: Check if voice editor instance exists
    if (window.voiceEditor) {
        console.log('✅ Voice editor instance created');
    } else {
        console.error('❌ Voice editor instance not found');
        return;
    }
    
    // Test 3: Check UI elements
    const voiceButton = document.getElementById('voiceEditBtn');
    const commandDisplay = document.getElementById('commandDisplay');
    const statusIndicator = document.getElementById('voiceStatus');
    
    if (voiceButton) {
        console.log('✅ Voice button found');
    } else {
        console.error('❌ Voice button not found');
    }
    
    if (commandDisplay) {
        console.log('✅ Command display element found');
    } else {
        console.error('❌ Command display element not found');
    }
    
    if (statusIndicator) {
        console.log('✅ Status indicator found');
    } else {
        console.error('❌ Status indicator not found');
    }
    
    // Test 4: Check Web Speech API support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        console.log('✅ Web Speech API supported');
    } else {
        console.warn('⚠️ Web Speech API not supported in this browser');
    }
    
    // Test 5: Check form fields for voice editing
    const testFields = ['fullName', 'email', 'phone', 'careerObjective', 'skills', 'projects'];
    let fieldsFound = 0;
    
    testFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            fieldsFound++;
            console.log(`✅ Form field '${fieldId}' found`);
        } else {
            console.log(`⚠️ Form field '${fieldId}' not found`);
        }
    });
    
    console.log(`📊 Found ${fieldsFound}/${testFields.length} expected form fields`);
    
    // Test 6: Simulate voice command processing (without actual speech)
    if (window.voiceEditor && window.voiceEditor.handleVoiceCommand) {
        console.log('🧪 Testing command processing...');
        
        // Test name update
        const originalName = document.getElementById('fullName')?.value;
        window.voiceEditor.handleVoiceCommand('update my name to Test User');
        const newName = document.getElementById('fullName')?.value;
        
        if (newName === 'Test User') {
            console.log('✅ Name update command working');
            // Restore original name
            if (originalName && document.getElementById('fullName')) {
                document.getElementById('fullName').value = originalName;
            }
        } else {
            console.error('❌ Name update command failed');
        }
        
        // Test skill addition
        const skillsField = document.getElementById('skills');
        if (skillsField) {
            const originalSkills = skillsField.value;
            window.voiceEditor.handleVoiceCommand('add skill voice recognition');
            const newSkills = skillsField.value;
            
            if (newSkills.includes('voice recognition')) {
                console.log('✅ Skill addition command working');
                // Restore original skills
                skillsField.value = originalSkills;
            } else {
                console.error('❌ Skill addition command failed');
            }
        }
    }
    
    console.log('🎉 Voice Editor integration test completed!');
    console.log('💡 To test voice recognition, click the "Start Voice Editing" button and speak a command.');
}

// Auto-run test when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testVoiceEditorIntegration);
} else {
    testVoiceEditorIntegration();
}

// Make test function available globally
window.testVoiceEditorIntegration = testVoiceEditorIntegration;
