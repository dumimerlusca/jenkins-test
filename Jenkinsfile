pipeline {
  agent any

    stage('Run Playwright Tests') {
        steps {
            script {
                docker.image('mcr.microsoft.com/playwright:v1.44.1-jammy') // Or whatever tag suits you
                    .inside('-u root') {
                        sh '''
                            npm ci
                            npx playwright install --with-deps
                            npx playwright test
                        '''
                    }
            }
        }
}

  stages {
    stage('Build') {
      steps {
        echo 'Building...'
      }
    }
    stage('Test') {
      steps {
        echo 'Running tests...'
      }
    }
    stage('Deploy') {
      steps {
        echo 'Deploying...'
      }
    }
  }
}
