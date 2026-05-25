pipeline {
    agent any

    tools {
        nodejs 'node26'
        // Fixed: Changed identifier to 'dependency-check' as required by Jenkins
        'dependency-check' 'OWASP-12.2.2'
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
            options {
                timeout(time: 10, unit: 'MINUTES')
            }
            steps {
                sh '''
                npm install --no-audit
                '''
            }
        }
        
        stage("NPM Dependencies") {
            steps {
                sh '''
                npm audit --audit-level=critical || true
                '''
            }
        }
        
        stage("OWASP Dependency Check") {
            steps {
                // Fixed: Added the required 'odcInstallation' parameter pointing to your tool name
                dependencyCheck odcInstallation: 'OWASP-12.2.2', additionalArguments: '--scan . --format ALL --out . --prettyPrint'
                junit allowEmptyResults: true, testResults: 'dependency-check-report.xml'
                dependencyCheckPublisher failedTotalCritical: 1, pattern: 'dependency-check-report.xml', stopBuild: true
            }
        }
        stage("Unit Tests") {
            steps {
                sh '''
                npm test
                '''
            }
        }
    }
}