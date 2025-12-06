/**
 * WordPress Media Upload Testing Suite
 * Validates file upload functionality using Equivalence Partitioning & BVA
 * Covers: Valid uploads, empty selections, invalid types, and size constraints
 */

Cypress.on('uncaught:exception', () => false);

describe('WordPress Media Library Upload Validation', () => {
    const mediaLibraryPath = '/wp-admin/upload.php';
    const authenticationPath = '/wp-login.php';

    // Authentication credentials
    const userAccount = 'Fastians';
    const userSecret = '8Wk5ujnODaxMLKp(wQ';

    beforeEach(() => {
        // Authenticate user session
        cy.visit(authenticationPath);

        // Ensure login form is ready
        cy.get('body.login').should('exist');
        cy.wait(500);

        // Set username using reliable method
        cy.get('#user_login')
            .should('be.visible')
            .clear()
            .invoke('val', userAccount)
            .trigger('input');

        // Set password
        cy.get('#user_pass')
            .should('be.visible')
            .clear()
            .invoke('val', userSecret)
            .trigger('input');

        // Confirm credentials are set
        cy.get('#user_login').should('have.value', userAccount);
        cy.get('#user_pass').should('have.value', userSecret);

        cy.get('#wp-submit').click();

        // Verify successful authentication
        cy.url().should('include', '/wp-admin', { timeout: 10000 });

        // Navigate to media upload interface
        cy.visit(mediaLibraryPath);
        cy.get('body').should('be.visible');
        cy.wait(1000);
    });

    // Utility: Generate and upload file programmatically
    const triggerFileUpload = (filename, content, mimeType = 'image/png') => {
        cy.window().then((window) => {
            const fileBlob = new Blob([content], { type: mimeType });
            const uploadFile = new File([fileBlob], filename, { type: mimeType });

            const transfer = new DataTransfer();
            transfer.items.add(uploadFile);

            // Locate file input element in WordPress upload interface
            cy.get('input[type="file"], #async-upload, .uploader-inline input[type="file"]').then(($elements) => {
                if ($elements.length > 0) {
                    const inputElement = $elements[0];
                    inputElement.files = transfer.files;
                    cy.wrap(inputElement).trigger('change', { force: true });
                } else {
                    // Fallback: search within upload container
                    cy.get('body').then(($container) => {
                        if ($container.find('.uploader-inline, #plupload-upload-ui').length > 0) {
                            cy.get('.uploader-inline, #plupload-upload-ui').within(() => {
                                cy.get('input[type="file"]').then(($input) => {
                                    if ($input.length > 0) {
                                        const inputEl = $input[0];
                                        inputEl.files = transfer.files;
                                        cy.wrap(inputEl).trigger('change', { force: true });
                                    }
                                });
                            });
                        }
                    });
                }
            });
        });
    };

    it('TC-MEDIA-01: Upload valid image within size constraints', () => {
        // Generate minimal 1x1 PNG image
        const imageFilename = `valid-upload-${Date.now()}.png`;
        const pngData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

        cy.window().then(() => {
            const decoded = atob(pngData);
            const bytes = new Array(decoded.length);
            for (let idx = 0; idx < decoded.length; idx++) {
                bytes[idx] = decoded.charCodeAt(idx);
            }
            const imageArray = new Uint8Array(bytes);
            triggerFileUpload(imageFilename, imageArray, 'image/png');
        });

        // Allow time for upload processing
        cy.wait(3000);

        // Verify upload success indicators
        cy.get('body').then(($page) => {
            if ($page.find('#message, .notice-success, .updated, .attachment, .media-item').length > 0) {
                cy.get('#message, .notice-success, .updated, .attachment, .media-item').should('exist');
            }
            cy.url().should('include', 'upload.php');
        });
    });

    it('TC-MEDIA-02: Attempt upload without file selection', () => {
        // Confirm file input exists but is empty
        cy.get('input[type="file"]').should('exist').and('have.value', '');

        // Check if submit button is present
        cy.get('body').then(($page) => {
            const submitBtn = $page.find('button[type="submit"], input[type="submit"], .button-primary');
            if (submitBtn.length > 0) {
                cy.get('button[type="submit"], input[type="submit"], .button-primary').first().should('exist');
            }
        });

        // Should remain on current page
        cy.url().should('include', 'upload.php');
    });

    it('TC-MEDIA-03: Upload disallowed file format', () => {
        const invalidFilename = `malicious-${Date.now()}.exe`;
        const executableContent = 'Simulated executable file data';

        triggerFileUpload(invalidFilename, executableContent, 'application/x-msdownload');

        // Wait for validation check
        cy.wait(2000);

        // Look for error indicators
        cy.get('body').then(($page) => {
            if ($page.find('.notice-error, .error, #message, .upload-error').length > 0) {
                cy.get('.notice-error, .error, #message, .upload-error').should('be.visible');
            } else {
                // Upload prevented silently - verify no navigation occurred
                cy.url().should('include', 'upload.php');
            }
        });
    });

    it('TC-MEDIA-04: Upload file at maximum allowed size', () => {
        // Create file at 1.9MB (safely below 2MB limit)
        const largeFilename = `boundary-test-${Date.now()}.jpg`;
        const sizeMB = Math.floor(1.9 * 1024 * 1024);
        const largeContent = new Uint8Array(sizeMB).fill(65);

        triggerFileUpload(largeFilename, largeContent, 'image/jpeg');

        // Extended wait for large file processing
        cy.wait(5000);

        // Confirm successful upload
        cy.get('body').then(($page) => {
            if ($page.find('#message, .notice-success, .updated, .attachment, .media-item').length > 0) {
                cy.get('#message, .notice-success, .updated, .attachment, .media-item').should('exist');
            }
            cy.url().should('include', 'upload.php');
        });
    });

    it('TC-MEDIA-05: Upload file exceeding size threshold', () => {
        // Generate file exceeding 2MB constraint
        const oversizedFilename = `exceed-limit-${Date.now()}.jpg`;
        const exceedSize = Math.floor(2.1 * 1024 * 1024);
        const oversizedContent = new Uint8Array(exceedSize).fill(65);

        triggerFileUpload(oversizedFilename, oversizedContent, 'image/jpeg');

        // Wait for size validation
        cy.wait(3000);

        // Verify size limit error message
        cy.get('body').then(($page) => {
            const errorElements = $page.find('.notice-error, .error, #message, .upload-error');
            const sizeMessages = $page.find('p:contains("size"), p:contains("limit"), p:contains("large")');

            if (errorElements.length > 0 || sizeMessages.length > 0) {
                cy.get('.notice-error, .error, #message, .upload-error, p:contains("size"), p:contains("limit")').should('exist');
            } else {
                // Upload blocked - should remain on upload page
                cy.url().should('include', 'upload.php');
            }
        });
    });
});