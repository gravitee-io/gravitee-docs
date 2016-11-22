node() {

    stage("Checkout") {
        checkout scm
    }

    stage("Build") {
        def mvnHome = tool 'MVN33'
        def javaHome = tool 'JDK 8'
        withEnv(["PATH+MAVEN=${mvnHome}/bin",
                 "JAVA_HOME=${javaHome}"]) {
            sh "mvn clean package"
        }
    }

    stage("Docker Build & Push") {
        sh "docker build -t graviteeio/docs:latest --pull=true ."
        sh "docker push graviteeio/docs:latest"
    }
}