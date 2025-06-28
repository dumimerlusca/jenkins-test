pipeline {
  agent any

  environment {
    ENV = 'dev'
  }

  stages {
   
    stage('Test') {
      steps {
        echo 'Running tests...'
          sh 'npm install'
          sh 'npx playwright install'
          sh 'npx playwright test --workers=4'
      }
    }
  }
}
