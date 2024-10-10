# Shift Manager API (Shifty)

## Overview

The Shift Manager API is a tool designed to help managers organize shifts and employees, and create schedules that respect each employee's preferences. This API allows for the management of employees, shifts, and scheduling within a given timespan, providing an efficient and organized solution for shift-based employment.

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Usage](#usage)

## Installation

### Prerequisites

- Node.js v22.2.0
- MySQL 8.3.0

### Steps

1. Clone the repository:

```sh
git clone https://github.com/maxwellknight/scheduler.git
cd scheduler
```

2. Install dependencies:

```sh
npm install
```

## Configuration

1. Create an .env file in the root directory
2. Copy these enviroment variables and modify them

```makefile
DATABASE_HOST=localhost
DATABASE_USER=database-user
DATABASE_PASSWORD=database-password
DATABASE_NAME=database-name

DATABASE_LOCAL_PORT = port-mapping-docker
DATABASE_DOCKER_PORT = port-mapping-docker

NODE_LOCAL_PORT = port-mapping-docker
NODE_DOCKER_PORT = port-mapping-docker
```

## Usage

Rune this command:

```sh
npm run dev
```
