pipeline {
    agent any
    stages {
        stage('Build') { 
            steps {
                dir('food-front-end') {
                    withDockerRegistry(credentialsId: 'DockerHub', url: 'https://index.docker.io/v1/') {
                        sh 'docker build -t ptrungduc1011/foodlyfe:v22 .'
                        sh 'docker push ptrungduc1011/foodlyfe:v22'     
                    }
                }
            }
        }
    }
}