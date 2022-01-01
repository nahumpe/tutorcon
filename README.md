# TutorCon
This application allows tutors to create their profiles and upload posts where they create a tutoring service for a specific subject, any user can then, hire the tutor for a number of hours, and pay him/her depending on his/her fee, also, see what service has hired and for how many hours.
demo: https://nahumpe.github.io/tutorcon/

Contract Methods

addPost: Adds the post struct to the map by the length of posts

getHireIndex: Returns the Indexes of the hires that a user has made by his/her address

getHireInfo: Returns the index of the hired post, and the hours hired

getPost: Returns the info about a post by the index

getPostsLength: Returns the posts length

getTutor:Returns the info about a tutor

getTutorsLength: Returns the tutors length

hireTutor: Tranfers the cUSD from one account to another and adds the hire info the reference of the address that payed

registerTutor: Add a tutor to the mab by the length of tutors

# Install

```

npm install

```

or 

```

yarn install

```

# Start

```

npm run dev

```

# Build

```

npm run build

```
# Usage
1. Install the [CeloExtensionWallet](https://chrome.google.com/webstore/detail/celoextensionwallet/kkilomkmpmkbdnfelcpgckmpcaemjcdh?hl=en) from the google chrome store.
2. Create a wallet.
3. Go to [https://celo.org/developers/faucet](https://celo.org/developers/faucet) and get tokens for the alfajores testnet.
4. Switch to the alfajores testnet in the CeloExtensionWallet.
