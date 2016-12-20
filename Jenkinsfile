node() {
    try {
        sh "rm -rf *"

        stage("Checkout") {
            checkout scm
        }

        stage("Jekyll Build") {
            sh "docker build -t gravitee.io/jekyll -f Dockerfile-build ."
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

        stage("Clean") {
            sh "docker run --rm -v '${env.WORKSPACE}:/src' gravitee.io/jekyll clean"
        }
    } catch (e) {
        currentBuild.result = "FAILED"
        sh "git log --format=short -n1 HEAD > GIT_LOG"
        def git_log = readFile encoding: 'UTF-8', file: 'GIT_LOG'

        slackSend (
                color: '#FF0000',
                message: ":poop: ${env.JOB_NAME} " +
                        "<${env.BUILD_URL}console|[#${env.BUILD_NUMBER}]>\n\r" +
                        "```${git_log}```")
        throw e
    }
}