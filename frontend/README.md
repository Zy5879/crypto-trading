# Crypto-Trading Application

## Instructions For Setting Up Project

- Make sure you have [Node.js](https://nodejs.org/en/download) installed

- Run `node --version and
npm --version` in terminal to make sure you have the neccessary packages.

- clone the project to whatever directory. `git clone git@github.com:Zy5879/crypto-trading.git`

- Do a `git pull` to make sure you have the latest changes

- cd into frontend `cd frontend`

- run `npm install` to download all dependencies.

- in the frontend directory you need to create a `.env` file that holds your API_KEY. In the `.env` file create a variable name `EXPO_PUBLIC_API_KEY` and set it equal to your CoinGecko API. It will look like this `EXPO_PUBLIC_API_KEY = YOUR_API_KEY`. You need this in order for the calls to CoinGecko to work.

- download expo app on your mobile device

- run `npx expo start`. Once its up a, it will output QR code for you to scan. Scan it on your phone and the Expo App will open up with your build. Whenever you make a change and save it, your Expo App will automatically update with the changes.

## Running Simulator (Windows)

- An easier option instead of loading the application on your phone is to run a simulator environment.

- [Follow this video to get it setup](https://www.youtube.com/watch?v=8ejuHsaXiwU)

## Running Simulator (Mac)

- An easier option instead of loading the application on your phone is to run a simulator environment.

- [Follow this video to get it setup](https://www.youtube.com/watch?v=LaRDgkq0Kfc)

## Git Flow

- When making code changes YOU DO NOT MAKE THEM ON THE MAIN BRANCH. You want to create your own local branch. Do a `git checkout -b <branch name>` in your terminal and it will switch to this branch and off the main branch.

- Once you are satisified with your code changes and want to commit them, in your terminal you want to run a `git add -A` this moves all your changes to staging. After you want to run a `git commit -m "<code change message goes here>"`. This can be whatever you like, but it will help if its short and concise with the overall theme of your changes.

- Ready to push it? Run `git push -u origin <your-branch-name-goes-here>` DO NOT PUSH TO MAIN.

- Once you pushed your branch you will see your branch with the changes in github. In order to merge your code changes into the main branch you need to open a pull request. In the pull request members of the change will review your code changes and if it looks good, we will approve it and merge it. THIS IS THE ONLY TIME YOU WILL MERGE TO THE MAIN BRANCH. YOU WILL NEED AT LEAST 2 APPROVALS BEFORE MERGING. Look up on youtube how to open a pull request.

- IF YOU HAVE ANY QUESTION WITH PUSHING AND MERGING JUST MESSAGE ME AND WE CAN DO A WALKTHROUGH
