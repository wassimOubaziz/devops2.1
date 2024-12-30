pipeline {
    agent any

    parameters {
        choice(name: 'SERVICE', choices: ['all', 'frontend', 'auth-service', 'project-service', 'task-service'])
        string(name: 'AWS_ACCOUNT_ID', defaultValue: '851725608377')
        string(name: 'AWS_REGION', defaultValue: 'us-east-1')
        string(name: 'VERSION', defaultValue: 'latest')
        string(name: 'CLUSTER_NAME', defaultValue: 'main-cluster')
        choice(name: 'TERRAFORM_ACTION', choices: ['none', 'plan', 'apply', 'destroy'])
    }

    tools {
        nodejs 'NodeJS'
    }

    environment {
        DOCKER_BUILDKIT = '1'
        TF_VAR_aws_region = "${params.AWS_REGION}"
        TF_VAR_project_name = "microdevops"
        TF_VAR_environment = "dev"
        GITHUB_REPO = "https://github.com/wassimOubaziz/devops2.git"
        DOCKER_REGISTRY = "${params.AWS_ACCOUNT_ID}.dkr.ecr.${params.AWS_REGION}.amazonaws.com"
        BUILD_VERSION = "${BUILD_NUMBER}"
        TF_VAR_db_username = credentials('db-username')
        TF_VAR_db_password = credentials('db-password')
    }

    stages {
        stage('Git Checkout') {
            steps {
                git branch: 'main', url: env.GITHUB_REPO
            }
        }

        stage('Terraform') {
            when {
                expression { params.TERRAFORM_ACTION != 'none' }
            }
            steps {
                withCredentials([
                    string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY'),
                    string(credentialsId: 'aws-token-key', variable: 'AWS_SESSION_TOKEN')
                ]) {
                    dir('terraform') {
                        script {
                            sh """
                            aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
                            aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
                            aws configure set aws_session_token $AWS_SESSION_TOKEN
                            aws configure set region ${params.AWS_REGION}
                            """
                            
                            sh 'terraform init -reconfigure'
                            
                            if (params.TERRAFORM_ACTION == 'plan') {
                                sh 'terraform plan'
                            } else if (params.TERRAFORM_ACTION == 'apply') {
                                sh 'terraform apply -auto-approve'
                                
                                // After successful apply, get RDS endpoint and update k8s secret
                                def rdsEndpoint = sh(
                                    script: 'terraform output -raw rds_endpoint',
                                    returnStdout: true
                                ).trim()
                                
                                // Update Kubernetes secret with RDS endpoint
                                sh """
                                    sed -i 's|\\${aws_db_instance.postgres.endpoint}|${rdsEndpoint}|g' ../k8s/db-secret.yaml
                                    sed -i 's|\\${var.db_username}|${TF_VAR_db_username}|g' ../k8s/db-secret.yaml
                                    sed -i 's|\\${var.db_password}|${TF_VAR_db_password}|g' ../k8s/db-secret.yaml
                                """
                            } else if (params.TERRAFORM_ACTION == 'destroy') {
                                sh 'terraform destroy -auto-approve'
                            }
                        }
                    }
                }
            }
        }

        stage('Install Dependencies') {
            when {
                expression { params.TERRAFORM_ACTION == 'none' }
            }
            steps {
                sh """
                    cd ./frontend
                    npm install --force
                    
                    cd ../backend/services/auth-service
                    npm install --force
                    
                    cd ../project-service
                    npm install --force
                    
                    cd ../task-service
                    npm install --force
                    
                    cd ../../..
                """
            }
        }

        stage('Create ECR Repositories') {
            when {
                expression { params.TERRAFORM_ACTION == 'none' }
            }
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
                        string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY'),
                        string(credentialsId: 'aws-token-key', variable: 'AWS_SESSION_TOKEN')
                    ]) {
                        sh """
                            aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
                            aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
                            aws configure set aws_session_token $AWS_SESSION_TOKEN
                            aws configure set region ${params.AWS_REGION}
                            
                            aws ecr get-login-password --region ${params.AWS_REGION} | docker login --username AWS --password-stdin ${DOCKER_REGISTRY}
                            
                            for repo in frontend auth-service project-service task-service; do
                                aws ecr describe-repositories --repository-names \$repo || aws ecr create-repository --repository-name \$repo
                            done
                        """
                    }
                }
            }
        }

        stage('Build and Push Docker Images') {
            when {
                expression { params.TERRAFORM_ACTION == 'none' }
            }
            steps {
                script {
                    def services = []
                    if (params.SERVICE == 'all') {
                        services = ['frontend', 'auth-service', 'project-service', 'task-service']
                    } else {
                        services = [params.SERVICE]
                    }
                    
                    services.each { service ->
                        def dockerfile = service == 'frontend' ? './frontend/Dockerfile' : "./backend/services/${service}/Dockerfile"
                        def context = service == 'frontend' ? './frontend' : "./backend/services/${service}"
                        
                        sh """
                            docker build -t ${DOCKER_REGISTRY}/${service}:${BUILD_VERSION} -f ${dockerfile} ${context}
                            docker push ${DOCKER_REGISTRY}/${service}:${BUILD_VERSION}
                        """
                    }
                }
            }
        }

        stage('Deploy to EKS') {
            when {
                expression { params.TERRAFORM_ACTION == 'none' }
            }
            steps {
                withCredentials([
                    string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY'),
                    string(credentialsId: 'aws-token-key', variable: 'AWS_SESSION_TOKEN')
                ]) {
                    sh """
                        aws eks update-kubeconfig --name ${params.CLUSTER_NAME} --region ${params.AWS_REGION}
                        
                        # Apply database secret first
                        kubectl apply -f k8s/db-secret.yaml
                        
                        # Replace image tags in service deployments
                        sed -i 's|\${AWS_ACCOUNT_ID}|${params.AWS_ACCOUNT_ID}|g' k8s/services.yaml
                        sed -i 's|\${AWS_REGION}|${params.AWS_REGION}|g' k8s/services.yaml
                        sed -i 's|\${BUILD_VERSION}|${BUILD_VERSION}|g' k8s/services.yaml
                        
                        # Apply service deployments
                        kubectl apply -f k8s/services.yaml
                    """
                }
            }
        }

        stage('Verify RDS Connection') {
            when {
                expression { params.TERRAFORM_ACTION == 'none' }
            }
            steps {
                script {
                    sh """
                        # Wait for pods to be ready
                        kubectl wait --for=condition=ready pod -l app=auth-service --timeout=300s
                        
                        # Get pods status
                        kubectl get pods
                        
                        # Check auth-service health
                        kubectl exec \$(kubectl get pod -l app=auth-service -o jsonpath="{.items[0].metadata.name}") -- curl -s http://localhost:3001/health
                    """
                }
            }
        }

        stage('Verify Deployment') {
            when {
                expression { params.TERRAFORM_ACTION == 'none' }
            }
            steps {
                script {
                    sh """
                        echo "Checking service endpoints..."
                        kubectl get svc
                        
                        echo "Checking pod status..."
                        kubectl get pods
                        
                        echo "Checking deployment status..."
                        kubectl get deployments
                        
                        echo "Getting frontend LoadBalancer URL..."
                        kubectl get svc frontend -o jsonpath="{.status.loadBalancer.ingress[0].hostname}"
                    """
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}