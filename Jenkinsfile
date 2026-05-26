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

        stage('NPM Dependencies Audit') {
            steps {
                sh '''
                    npm audit --audit-level=critical || true
                '''
            }
        }

        stage('OWASP Dependency Check') {
            steps {

                dependencyCheck(
                    odcInstallation: 'OWASP-12.2.2',
                    additionalArguments: '''
                        --scan . 
                        --format XML 
                        --out .
                        --disableYarnAudit 
                        --prettyPrint
                    '''
                )

                dependencyCheckPublisher(
                    pattern: 'dependency-check-report.xml',
                    failedTotalCritical: 1,
                    stopBuild: true
                )
            }
        }

        stage('Unit Tests') {
            steps {
                sh '''
                    npm test
                '''
            }
        }

        stage('Code Coverage') {
            steps {

                catchError(
                    buildResult: 'SUCCESS',
                    stageResult: 'UNSTABLE',
                    message: 'Coverage failed but pipeline continues'
                ) {

                    sh '''
                        npm run test:coverage
                    '''
                }

                publishHTML(target: [
                    allowMissing: true,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'coverage/lcov-report',
                    reportFiles: 'index.html',
                    reportName: 'Code Coverage Report'
                ])
            }
        }

        stage('SonarQube Analysis') {
            steps {

                withSonarQubeEnv('sonar-qube-server') {

                    sh '''
                        echo "Using Sonar Scanner at : $scannerHome"

                        $scannerHome/bin/sonar-scanner \
                            -Dsonar.projectKey=devops-demo \
                            -Dsonar.sources=. \
                            -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                            -Dsonar.coverage.exclusions=server.js \
                            -Dsonar.exclusions=coverage/**,node_modules/**,trivy-*,dependency-check-*
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Image') {
            steps {

                sh '''
                    docker build -t temitayo15/devops-demo:${GIT_COMMIT} .
                '''
            }
        }

        stage('Trivy Vulnerability Scan') {
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

            post {
                always {

                    sh '''
                        trivy convert \
                            --format template \
                            --template "@/usr/local/share/trivy/templates/html.tpl" \
                            --output trivy-image-MEDIUM-results.html \
                            trivy-image-MEDIUM-results.json

                        trivy convert \
                            --format template \
                            --template "@/usr/local/share/trivy/templates/html.tpl" \
                            --output trivy-image-CRITICAL-results.html \
                            trivy-image-CRITICAL-results.json

                        trivy convert \
                            --format template \
                            --template "@/usr/local/share/trivy/templates/junit.tpl" \
                            --output trivy-image-MEDIUM-results.xml \
                            trivy-image-MEDIUM-results.json

                        trivy convert \
                            --format template \
                            --template "@/usr/local/share/trivy/templates/junit.tpl" \
                            --output trivy-image-CRITICAL-results.xml \
                            trivy-image-CRITICAL-results.json
                    '''
                }
            }
        }

        stage('Push Docker Image') {
            steps {

                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD')]) {

                    sh '''
                        echo $DOCKERHUB_PASSWORD | docker login -u $DOCKERHUB_USERNAME --password-stdin
                        docker push temitayo15/devops-demo:${GIT_COMMIT}
                    '''
                }
            }
         }

         stage("EC2 Deployment"){
           when {
                branch 'feature/*'
            }
            steps {
                script {
                    sshagent(['aws-dev-deploy-ec2']) {
                        sh '''
                            ssh -o StrictHostKeyChecking=no ubuntu@13.220.93.9 << 'EOF'
                                docker pull temitayo15/devops-demo:${GIT_COMMIT}
                                docker stop devops-demo || true
                                docker rm devops-demo || true
                                docker run -d --name devops-demo -p 3000:3000 temitayo15/devops-demo:${GIT_COMMIT}
                            EOF
                        '''
                    }
                }
            }
    
        }
    }


       

    post {

        always {

            // junit allowEmptyResults: true,
            //        testResults: 'trivy-image-MEDIUM-results.xml'

            // junit allowEmptyResults: true,
            //        testResults: 'trivy-image-CRITICAL-results.xml'

            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: './',
                reportFiles: 'trivy-image-MEDIUM-results.html',
                reportName: 'Trivy Image MEDIUM Vulnerabilities'
            ])

            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: './',
                reportFiles: 'trivy-image-CRITICAL-results.html',
                reportName: 'Trivy Image CRITICAL Vulnerabilities'
            ])

            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'coverage/lcov-report',
                reportFiles: 'index.html',
                reportName: 'Coverage Report'
            ])
        }

        success {
            echo 'Pipeline completed successfully!!'
        }

        failure {
            echo 'Pipeline failed!!!'    
        }
    }
}