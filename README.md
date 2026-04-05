# PyWeb (A Cloud-Based Job Processing Platform)

A distributed system for submitting and executing code jobs using AWS services, featuring scalable backend processing and a web-based interface.

---

## Features

- Submit and execute code jobs via web UI  
- Asynchronous processing using SQS + Lambda  
- Real-time job status tracking  
- Scalable architecture with ALB and Auto Scaling  
- Secure and isolated execution environment  

---

## Architecture

- **Frontend:** Next.js  
- **Backend:** AWS Lambda  
- **Queue:** Amazon SQS  
- **Database:** DynamoDB  
- **Compute:** EC2 (Auto Scaling Group)  
- **Load Balancer:** Application Load Balancer (ALB)

---

## Setup

### Frontend

```bash
pnpm install
pnpm dev
```

---

## Deployment Overview

- EC2 instances serve the frontend application  
- ALB distributes incoming traffic  
- Auto Scaling Group ensures availability and scalability  
- Lambda workers process jobs from SQS  
- DynamoDB stores job metadata and results  

---

## Scalability & Reliability

- Horizontal scaling via Auto Scaling Group  
- Fault tolerance through load balancing  
- Decoupled architecture using message queues  

---

## Future Improvements

- Containerized execution (ECS/Fargate)  
- WebSocket-based real-time updates  
- Enhanced security sandboxing  
- Multi-language support  
