pipeline{
    agent any

    tools {
        nodejs 'node18'
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
                    npm ci
                    '''
                }
            }
    
            stage('Run Tests') {
                steps {
                    sh '''
                    npm test
                    '''
                }
            }

    }
}