pipeline {
  agent none
  stages {
    stage('Test Backend') {
      agent {
        docker {
          image 'node:22-alpine'
          args '-u root'
        }
      }
      stages {
        stage('Setup') {
          steps {
            sh '''
corepack enable
corepack prepare pnpm@latest --activate
pnpm --version
            '''
          }
        }
        stage('Install Dependencies') {
          steps {
            dir('backend') {
              sh 'pnpm install'
            }
          }
        }
        stage('Compile Contracts') {
          steps {
            dir('backend') {
              sh 'pnpm hardhat compile'
            }
          }
        }
        stage('Run Tests') {
          steps {
            dir('backend') {
              sh 'pnpm hardhat test'
            }
          }
        }
      }
      post {
        success {
          echo 'Tests passed'
        }
        failure {
          echo 'Tests failed'
        }
      }
    }

  stage('Deploy System') {
    agent { label 'built-in' }

    steps {
      withCredentials([file(credentialsId: '5a5508ad-b632-4a18-b5f2-c2875929d448', variable: 'ENV_FILE')]) {
        sh '''
  echo "Starting deployment..."

  # Copy the secret .env into workspace
  cp $ENV_FILE .env

  # Verify (optional, remove later)
  echo ".env file loaded"
  ls -la .env

  # Deploy
  docker compose down || true
  docker compose up -d --build

  echo "Deployment complete"
  '''
      }
    }
  }
  post {
    success {
      echo 'Pipeline succeeded - system deployed'
    }
    failure {
      echo 'Pipeline failed - deployment skipped'
    }
  }
}
