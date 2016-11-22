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

    stage("Restart docs container") {
        sh "docker stop docs"
        sh "docker rm docs"
        sh "docker run -d --name docs graviteeio/docs:latest"
    }
}