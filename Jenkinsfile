pipeline {
  agent none
  environment {
    PNPM_HOME = "/root/.local/share/pnpm"
    PATH = "$PNPM_HOME:$PATH"
  }
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
        sh '''
echo "Starting deployment..."
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
