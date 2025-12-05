// Import cypress-axe commands
import 'cypress-axe'

// Custom commands
Cypress.Commands.add('injectAxe', () => {
  cy.window({ log: false }).then(window => {
    const script = window.document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.0/axe.min.js'
    window.document.head.appendChild(script)
    
    return new Cypress.Promise((resolve) => {
      script.onload = () => {
        resolve()
      }
    })
  })
})

Cypress.Commands.add('checkA11y', (context, options, violationCallback, skipFailures) => {
  cy.window({ log: false }).then(window => {
    if (window.axe) {
      return window.axe.run(context || window.document, options || {})
    }
  }).then(results => {
    if (results && results.violations.length > 0) {
      if (violationCallback) {
        violationCallback(results.violations)
      }
      
      if (!skipFailures) {
        const violationData = results.violations.map(v => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          nodes: v.nodes.length
        }))
        
        throw new Error(
          `${results.violations.length} accessibility violation(s) detected:\n` +
          JSON.stringify(violationData, null, 2)
        )
      }
    }
  })
})
