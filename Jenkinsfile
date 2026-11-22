pipeline {
    agent any
    
    environment {
        // Docker Registry
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_USERNAME = credentials('docker-hub-credentials')
        IMAGE_NAME = 'news-pulse-app'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        
        // Application Port
        APP_PORT = '8080'
        
        // Node version
        NODE_VERSION = '18'
    }
    
    tools {
        nodejs "NodeJS-${NODE_VERSION}"
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    echo '📦 Checking out code from repository...'
                    checkout scm
                }
            }
        }
        
        stage('Environment Setup') {
            steps {
                script {
                    echo '🔧 Setting up environment...'
                    sh '''
                        node --version
                        npm --version
                        docker --version
                    '''
                }
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            script {
                                echo '📥 Installing backend dependencies...'
                                sh 'npm ci'
                            }
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            script {
                                echo '📥 Installing frontend dependencies...'
                                sh 'npm ci'
                            }
                        }
                    }
                }
            }
        }
        
        stage('Lint & Type Check') {
            parallel {
                stage('Backend Lint') {
                    steps {
                        dir('backend') {
                            script {
                                echo '🔍 Linting backend code...'
                                sh 'npm run lint || true'
                            }
                        }
                    }
                }
                stage('Backend Type Check') {
                    steps {
                        dir('backend') {
                            script {
                                echo '🔍 Type checking backend...'
                                sh 'npx tsc --noEmit'
                            }
                        }
                    }
                }
                stage('Frontend Type Check') {
                    steps {
                        dir('frontend') {
                            script {
                                echo '🔍 Type checking frontend...'
                                sh 'npx tsc --noEmit'
                            }
                        }
                    }
                }
            }
        }
        
        stage('Unit Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            script {
                                echo '🧪 Running backend tests...'
                                sh 'npm test -- --coverage --watchAll=false'
                            }
                        }
                    }
                    post {
                        always {
                            junit 'backend/coverage/junit.xml'
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'backend/coverage/lcov-report',
                                reportFiles: 'index.html',
                                reportName: 'Backend Coverage Report'
                            ])
                        }
                    }
                }
            }
        }
        
        stage('Build') {
            parallel {
                stage('Build Backend') {
                    steps {
                        dir('backend') {
                            script {
                                echo '🏗️ Building backend...'
                                sh 'npm run build'
                            }
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        dir('frontend') {
                            script {
                                echo '🏗️ Building frontend...'
                                sh 'npm run build'
                            }
                        }
                    }
                }
            }
        }
        
        stage('Docker Build') {
            steps {
                script {
                    echo '🐳 Building unified Docker image...'
                    sh """
                        docker build \
                            -t ${DOCKER_REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG} \
                            -t ${DOCKER_REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:latest \
                            --build-arg NODE_VERSION=${NODE_VERSION} \
                            .
                    """
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                script {
                    echo '🔒 Running security scans...'
                    sh """
                        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                            aquasec/trivy image \
                            --exit-code 0 \
                            --severity HIGH,CRITICAL \
                            ${DOCKER_REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG} || true
                    """
                }
            }
        }
        
        stage('Push to Registry') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo '📤 Pushing images to Docker registry...'
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-hub-credentials') {
                        sh """
                            docker push ${DOCKER_REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}
                            docker push ${DOCKER_REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:latest
                        """
                    }
                }
            }
        }
        
        stage('Deploy to Development') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    echo '🚀 Deploying to Development environment...'
                    sh """
                        docker-compose down || true
                        docker-compose up -d
                    """
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo '🚀 Deploying to Production environment...'
                    input message: 'Deploy to Production?', ok: 'Deploy'
                    sh """
                        docker-compose down || true
                        docker-compose up -d
                    """
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    echo '🏥 Running health checks...'
                    sh '''
                        sleep 10
                        curl -f http://localhost:8080/api/v1/health || exit 1
                    '''
                }
            }
        }
    }
    
    post {
        always {
            echo '🧹 Cleaning up...'
            sh 'docker system prune -f || true'
            cleanWs()
        }
        success {
            echo '✅ Pipeline completed successfully!'
            echo "Unified Image: ${DOCKER_REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}"
            echo "Access app: http://localhost:8080"
        }
        failure {
            echo '❌ Pipeline failed!'
            echo "Check console output: ${env.BUILD_URL}console"
        }
    }
}
