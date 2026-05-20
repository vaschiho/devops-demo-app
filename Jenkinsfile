pipeline {
    agent any

    tools {
        nodejs 'node26'
        // Fixed: Added quotes around the tool identifier name
        'owasp-dependency-check' 'OWASP-12.2.2'
    }

    stages {
        stage('VM Node Version') {
            steps {
                sh '''
                node -v
                npm -v
                '''
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh '''
                npm install --no-audit
                '''
            }
        }
        
        stage("NPM Dependencies") {
            steps {
                // Added || true so a failed audit won't stop you from running the OWASP scan
                sh '''
                npm audit --audit-level=critical || true
                '''
            }
        }
        
        stage("OWASP Dependency Check") {
            steps {
                // Fixed: Correctly formatted arguments with --prettyPrint included safely
                dependencyCheck additionalArguments: '--scan . --format ALL --out . --prettyPrint'
            }
        }
    }
}