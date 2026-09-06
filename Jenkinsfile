pipeline {
    agent any
    environment {
        IMAGE_NAME = "ptrungduc1011/foodlyfe"
        IMAGE_TAG = "v${BUILD_NUMBER}"
    }
    stages {
        stage('Build & Push') { 
            steps {
                dir('food-front-end') {
                    withDockerRegistry(credentialsId: 'DockerHub', url: 'https://index.docker.io/v1/') {
                        sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest ."
                        sh "docker push ${IMAGE_NAME}:${IMAGE_TAG}"
                        sh "docker push ${IMAGE_NAME}:latest"
                    }
                }
            }
        }
        stage('Deploy') {
            steps {
                sh """
                    docker stop foodlyfe || true
                    docker rm foodlyfe || true

                    docker run -d \
                      --name foodlyfe \
                      -p 5173:80 \
                      --restart unless-stopped \
                      ${IMAGE_NAME}:${IMAGE_TAG}
                """
            }
        }
    }
    post {
        always {
            
            sh 'docker image prune -f || true'
        }
    }
}