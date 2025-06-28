// dragdrop.js - Resume Section Drag and Drop Functionality

// Initialize drag and drop functionality
let sortableInstance = null;

// Default section order
const DEFAULT_SECTION_ORDER = [
    'objective',
    'skills',
    'experience',
    'education',
    'projects',
    'certifications'
];

// Function to initialize SortableJS
function initializeDragDrop() {
    const resumeContainer = document.querySelector('#resumePreview .resume-container');
    
    if (!resumeContainer) {
        console.warn('Resume container not found for drag and drop initialization');
        return;
    }

    // Destroy existing sortable instance if it exists
    if (sortableInstance) {
        sortableInstance.destroy();
    }

    // Initialize SortableJS
    sortableInstance = new Sortable(resumeContainer, {
        // Only allow dragging of resume sections, not the header
        draggable: '.resume-section',
        
        // Visual feedback
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        
        // Animation
        animation: 200,
        easing: 'cubic-bezier(1, 0, 0, 1)',
        
        // Handle configuration
        handle: '.section-drag-handle',
        
        // Callbacks
        onStart: function(evt) {
            // Add visual feedback when dragging starts
            evt.item.style.opacity = '0.8';
            
            // Show drag handles on all sections
            showAllDragHandles();
        },
        
        onEnd: function(evt) {
            // Reset opacity
            evt.item.style.opacity = '1';
            
            // Hide drag handles
            hideAllDragHandles();
            
            // Save the new order
            saveSectionOrder();
            
            // Show success message
            showDragDropAlert('Section order updated!', 'success');
        },
        
        onMove: function(evt) {
            // Prevent moving into the header section
            return !evt.related.classList.contains('resume-header');
        }
    });

    // Add drag handles to all sections
    addDragHandles();
    
    // Apply saved section order
    applySavedSectionOrder();
}

// Function to add drag handles to resume sections
function addDragHandles() {
    const sections = document.querySelectorAll('#resumePreview .resume-section');
    
    sections.forEach(section => {
        // Check if drag handle already exists
        if (section.querySelector('.section-drag-handle')) {
            return;
        }

        const sectionTitle = section.querySelector('.section-title');
        if (sectionTitle) {
            // Create drag handle
            const dragHandle = document.createElement('div');
            dragHandle.className = 'section-drag-handle';
            dragHandle.innerHTML = '<i class="fas fa-grip-vertical"></i>';
            dragHandle.title = 'Drag to reorder sections';
            
            // Add drag handle styles
            dragHandle.style.cssText = `
                position: absolute;
                left: -30px;
                top: 50%;
                transform: translateY(-50%);
                cursor: move;
                opacity: 0;
                transition: opacity 0.2s ease;
                color: #6c757d;
                font-size: 14px;
                padding: 5px;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 3px;
                border: 1px solid #dee2e6;
            `;
            
            // Make section title container relative for positioning
            sectionTitle.style.position = 'relative';
            
            // Add drag handle
            sectionTitle.appendChild(dragHandle);
            
            // Show drag handle on hover
            section.addEventListener('mouseenter', () => {
                if (!section.classList.contains('dragging')) {
                    dragHandle.style.opacity = '1';
                }
            });
            
            section.addEventListener('mouseleave', () => {
                if (!document.querySelector('.sortable-chosen')) {
                    dragHandle.style.opacity = '0';
                }
            });
        }
        
        // Add section identifier
        addSectionIdentifier(section);
    });
}

// Function to add section identifiers based on content
function addSectionIdentifier(section) {
    const titleElement = section.querySelector('.section-title');
    if (!titleElement || section.dataset.sectionId) {
        return;
    }
    
    const titleText = titleElement.textContent.toLowerCase();
    
    if (titleText.includes('objective')) {
        section.dataset.sectionId = 'objective';
    } else if (titleText.includes('skill')) {
        section.dataset.sectionId = 'skills';
    } else if (titleText.includes('experience')) {
        section.dataset.sectionId = 'experience';
    } else if (titleText.includes('education')) {
        section.dataset.sectionId = 'education';
    } else if (titleText.includes('project')) {
        section.dataset.sectionId = 'projects';
    } else if (titleText.includes('certification')) {
        section.dataset.sectionId = 'certifications';
    } else {
        // Generic identifier based on title
        section.dataset.sectionId = titleText.replace(/[^a-z0-9]/g, '_');
    }
}

// Function to show all drag handles
function showAllDragHandles() {
    const handles = document.querySelectorAll('.section-drag-handle');
    handles.forEach(handle => {
        handle.style.opacity = '1';
    });
}

// Function to hide all drag handles
function hideAllDragHandles() {
    const handles = document.querySelectorAll('.section-drag-handle');
    handles.forEach(handle => {
        handle.style.opacity = '0';
    });
}

// Function to save current section order to localStorage
function saveSectionOrder() {
    const sections = document.querySelectorAll('#resumePreview .resume-section');
    const order = Array.from(sections).map(section => section.dataset.sectionId).filter(id => id);
    
    localStorage.setItem('resumeSectionOrder', JSON.stringify(order));
    console.log('Section order saved:', order);
}

// Function to apply saved section order
function applySavedSectionOrder() {
    const savedOrder = localStorage.getItem('resumeSectionOrder');
    
    if (!savedOrder) {
        console.log('No saved section order found');
        return;
    }
    
    try {
        const order = JSON.parse(savedOrder);
        reorderSections(order);
        console.log('Applied saved section order:', order);
    } catch (error) {
        console.error('Error applying saved section order:', error);
    }
}

// Function to reorder sections based on provided order
function reorderSections(order) {
    const container = document.querySelector('#resumePreview .resume-container');
    if (!container) return;
    
    const header = container.querySelector('.resume-header');
    const sections = Array.from(container.querySelectorAll('.resume-section'));
    
    // Create a map of sections by their ID
    const sectionMap = {};
    sections.forEach(section => {
        if (section.dataset.sectionId) {
            sectionMap[section.dataset.sectionId] = section;
        }
    });
    
    // Remove all sections from container
    sections.forEach(section => section.remove());
    
    // Re-add sections in the specified order
    order.forEach(sectionId => {
        if (sectionMap[sectionId]) {
            container.appendChild(sectionMap[sectionId]);
        }
    });
    
    // Add any sections that weren't in the saved order
    sections.forEach(section => {
        if (section.dataset.sectionId && !order.includes(section.dataset.sectionId)) {
            container.appendChild(section);
        }
    });
}

// Function to reset section order to default
function resetSectionOrder() {
    // Remove saved order
    localStorage.removeItem('resumeSectionOrder');
    
    // Apply default order
    reorderSections(DEFAULT_SECTION_ORDER);
    
    showDragDropAlert('Section order reset to default!', 'info');
}

// Function to enable/disable drag and drop
function toggleDragDrop(enable = true) {
    if (sortableInstance) {
        sortableInstance.option('disabled', !enable);
    }
    
    const handles = document.querySelectorAll('.section-drag-handle');
    handles.forEach(handle => {
        handle.style.display = enable ? 'block' : 'none';
    });
}

// Alert function for drag and drop feedback
function showDragDropAlert(message, type = 'info') {
    // Remove any existing drag-drop alerts
    const existingAlert = document.querySelector('.dragdrop-alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show dragdrop-alert`;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        min-width: 300px;
        text-align: center;
    `;
    alertDiv.innerHTML = `
        <i class="fas fa-arrows-alt me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // Add to document
    document.body.appendChild(alertDiv);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (alertDiv && alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 3000);
}

// Function to add drag and drop control buttons
function addDragDropControls() {
    const controlsContainer = document.querySelector('.preview-controls');
    if (!controlsContainer) return;
    
    // Check if controls already exist
    if (controlsContainer.querySelector('.dragdrop-controls')) {
        return;
    }
    
    const dragDropControls = document.createElement('div');
    dragDropControls.className = 'dragdrop-controls mt-3';
    dragDropControls.innerHTML = `
        <div class="row">
            <div class="col-12">
                <div class="alert alert-light border mb-0">
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <i class="fas fa-arrows-alt me-2 text-primary"></i>
                            <strong>Drag & Drop:</strong> 
                            <span class="text-muted">Hover over section titles to see drag handles. Drag sections to reorder them.</span>
                        </div>
                        <div>
                            <button type="button" class="btn btn-sm btn-outline-secondary" id="resetOrderBtn">
                                <i class="fas fa-undo me-1"></i>Reset Order
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-primary ms-2" id="toggleDragBtn">
                                <i class="fas fa-lock me-1"></i>Lock Layout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    controlsContainer.appendChild(dragDropControls);
    
    // Add event listeners
    document.getElementById('resetOrderBtn').addEventListener('click', resetSectionOrder);
    
    const toggleBtn = document.getElementById('toggleDragBtn');
    let isDragEnabled = true;
    
    toggleBtn.addEventListener('click', function() {
        isDragEnabled = !isDragEnabled;
        toggleDragDrop(isDragEnabled);
        
        if (isDragEnabled) {
            this.innerHTML = '<i class="fas fa-lock me-1"></i>Lock Layout';
            this.className = 'btn btn-sm btn-outline-primary ms-2';
        } else {
            this.innerHTML = '<i class="fas fa-unlock me-1"></i>Unlock Layout';
            this.className = 'btn btn-sm btn-success ms-2';
        }
    });
}

// Enhanced render function that integrates with existing preview.js
function enhanceResumePreviewWithDragDrop(originalRenderFunction) {
    return function(data) {
        // Call original render function
        originalRenderFunction(data);
        
        // Wait for DOM to be updated, then initialize drag and drop
        setTimeout(() => {
            initializeDragDrop();
            addDragDropControls();
        }, 100);
    };
}

// Function to add CSS styles for drag and drop
function addDragDropStyles() {
    const styleId = 'dragdrop-styles';
    if (document.getElementById(styleId)) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .sortable-ghost {
            opacity: 0.4;
            background: #f8f9fa !important;
            border: 2px dashed #007bff !important;
        }
        
        .sortable-chosen {
            cursor: move;
            box-shadow: 0 4px 8px rgba(0,123,255,0.3) !important;
        }
        
        .sortable-drag {
            opacity: 0.8;
            transform: rotate(5deg);
        }
        
        .resume-section {
            transition: all 0.2s ease;
            position: relative;
            margin-bottom: 1.5rem !important;
        }
        
        .resume-section:hover {
            background: rgba(0,123,255,0.02);
            border-radius: 8px;
        }
        
        .section-drag-handle:hover {
            color: #007bff !important;
            transform: translateY(-50%) scale(1.1);
        }
        
        .resume-container {
            padding-left: 40px !important;
        }
        
        @media (max-width: 768px) {
            .resume-container {
                padding-left: 20px !important;
            }
            
            .section-drag-handle {
                left: -25px !important;
                font-size: 12px !important;
            }
        }
        
        @media print {
            .section-drag-handle {
                display: none !important;
            }
            
            .resume-container {
                padding-left: 20px !important;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add CSS styles
    addDragDropStyles();
    
    // Check if SortableJS is loaded
    if (typeof Sortable === 'undefined') {
        console.warn('SortableJS not loaded. Please include SortableJS library.');
        
        // Dynamically load SortableJS if not present
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js';
        script.onload = function() {
            console.log('SortableJS loaded dynamically');
            // Initialize after a short delay to ensure resume is rendered
            setTimeout(() => {
                if (document.querySelector('#resumePreview .resume-section')) {
                    initializeDragDrop();
                    addDragDropControls();
                }
            }, 500);
        };
        document.head.appendChild(script);
    } else {
        // SortableJS is already loaded
        setTimeout(() => {
            if (document.querySelector('#resumePreview .resume-section')) {
                initializeDragDrop();
                addDragDropControls();
            }
        }, 500);
    }
});

// Function to reinitialize drag and drop (useful when resume is re-rendered)
function reinitializeDragDrop() {
    setTimeout(() => {
        initializeDragDrop();
        addDragDropControls();
    }, 100);
}

// Export functions for use in other scripts
if (typeof window !== 'undefined') {
    window.dragDropFunctions = {
        initializeDragDrop,
        reinitializeDragDrop,
        resetSectionOrder,
        toggleDragDrop,
        enhanceResumePreviewWithDragDrop
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeDragDrop,
        reinitializeDragDrop,
        resetSectionOrder,
        toggleDragDrop,
        enhanceResumePreviewWithDragDrop
    };
}
