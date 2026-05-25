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
        stage("Build Docker Image") {
            steps {
                sh "printenv"

                sh '''
                docker build -t temitayo15/devops-demo:$GIT_COMMIT .
                '''
            }
        }

        stage('Trivy Vulnerability Scanner') {
            steps {
                sh '''
                    trivy image temitayo15/devops-demo:${GIT_COMMIT} \
                        --severity LOW,MEDIUM \
                        --exit-code 0 \
                        --quiet \
                        --format json \
                        -o trivy-image-MEDIUM-results.json

                    trivy image temitayo15/devops-demo:${GIT_COMMIT} \
                        --severity HIGH,CRITICAL \
                        --exit-code 1 \
                        --quiet \
                        --format json \
                        -o trivy-image-CRITICAL-results.json
                '''
            }
        }
        post {
            always {
                sh '''
                    trivy convert \
                        --format template --template "@/usr/local/share/trivy/templates/html.tpl" \
                        --output trivy-image-MEDIUM-results.html trivy-image-MEDIUM-results.json

                    trivy convert \
                        --format template --template "@/usr/local/share/trivy/templates/html.tpl" \
                        --output trivy-image-CRITICAL-results.html trivy-image-CRITICAL-results.json

                    trivy convert \
                        --format template --template "@/usr/local/share/trivy/templates/junit.tpl" \
                        --output trivy-image-MEDIUM-results.xml trivy-image-MEDIUM-results.json

                    trivy convert \
                        --format template --template "@/usr/local/share/trivy/templates/junit.tpl" \
                        --output trivy-image-CRITICAL-results.xml trivy-image-CRITICAL-results.json
                    '''
            }
        }
        post {
            always {

                junit allowEmptyResults: true, stdioRetention: '', testResults: 'test-results.xml'
                junit allowEmptyResults: true, stdioRetention: '',  testResults: 'dependency-check-junit.xml'
                publishHTML([ allowMissing: true, alwaysLinkToLastBuild: true, keepAll: true, reportDir: './',  reportFiles: 'trivy-image-MEDIUM-results.html', reportName: 'Trivy Image MEDIUM Vulnerabilities' ])
                publishHTML([ allowMissing: true, alwaysLinkToLastBuild: true, keepAll: true, reportDir: './',  reportFiles: 'trivy-image-CRITICAL-results.html', reportName: 'Trivy Image CRITICAL Vulnerabilities' ])
                publishHTML([ allowMissing: true, alwaysLinkToLastBuild: true, keepAll: true, reportDir: './',  reportFiles: 'index.html', reportName: 'HTML Report' ])  
                publishHTML([ allowMissing: true, alwaysLinkToLastBuild: true, keepAll: true, reportDir: 'coverage/lcov-report', reportFiles: 'index.html',  reportName: 'Coverage Report' ])
       
                
            }
        }
    }
}