node() {
    sh "rm -rf *"
    sh "rm -rf .*"

    stage("Checkout") {
        checkout scm
    }

    stage("Jekyll Build") {
        sh "docker build --no-cache -t gravitee.io/jekyll -f Dockerfile-build ."
        sh "docker run --rm -v '${env.WORKSPACE}:/src' gravitee.io/jekyll build"
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