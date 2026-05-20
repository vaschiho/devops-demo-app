pipeline{
    agent any

    tools {
        nodejs 'node26'
        owasp-dependency-check 'OWASP-12.2.2'
    }

    stages{
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
                    sh '''
                    npm audit --audit-level=critical
                    echo $?
                    
                    '''
                }
            }
        stage("OWASP Dependency Check") {
            steps {
                dependencyCheck additionalArguments: '--scan . --format ALL --out . --prettyPrint'
            }
        }


    }
}