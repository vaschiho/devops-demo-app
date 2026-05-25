pipeline {
    agent any

    tools {
        nodejs 'node26'
    }

    environment {
        scannerHome = tool 'sonarqube8.1.0.6389'
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
                dependencyCheck(
                    odcInstallation: 'OWASP-12.2.2',
                    additionalArguments: '--scan . --format ALL --out . --disableYarnAudit --prettyPrint' 
                )

                junit allowEmptyResults: true,
                      testResults: 'dependency-check-report.xml'

                dependencyCheckPublisher(
                    failedTotalCritical: 1,
                    pattern: 'dependency-check-report.xml',
                    stopBuild: true
                )
            }
        }

        stage("Unit Tests") {
            steps {
                sh '''
                npm test
                '''
            }
        }

        stage("Code Coverage") {
            steps {

                catchError(
                    buildResult: 'SUCCESS',
                    message: 'Oops! it may be fixed later but for now, it is unstable',
                    stageResult: 'UNSTABLE'
                ) {
                    sh '''
                    npm run test:coverage
                    '''
                }

                publishHTML(target: [
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'coverage/lcov-report',
                    reportFiles: 'index.html',
                    reportName: 'Code Coverage Report'
                ])
            }
        }
        stage("SonarQube Analysis") {
            steps {
                timeout(time: 120, unit: 'SECONDS') {
                    withSonarQubeEnv('sonar-qube-server') {   

                        sh 'echo ${scannerHome}'
                        sh '''
                        $scannerHome/bin/sonar-scanner \
                            -Dsonar.projectKey=devops-demo \
                            -Dsonar.sources=. \
                            -Dsonar.javascript.lcov.reportPaths=./coverage/lcov.info \
                        '''
                    }
                    waitForQualityGate abortPipeline: true
                }
            }

        }
    }
}