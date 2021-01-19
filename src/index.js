App = {
	contracts : {},
	load : async () => {
		await App.loadWeb3()
		await App.loadAccount()
		await App.loadContract()
		await App.render()
	},

	// https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
	  loadWeb3: async () => {
	    if (typeof web3 !== 'undefined') {
	      App.web3Provider = web3.currentProvider
	      web3 = new Web3(web3.currentProvider)
	    } else {
	      window.alert("Please connect to Metamask.")
	    }
	    // Modern dapp browsers...
	    if (window.ethereum) {
	      window.web3 = new Web3(ethereum)
	      try {
	        // Request account access if needed
	        await ethereum.enable()
	        // Acccounts now exposed
	        web3.eth.sendTransaction({/* ... */})
	      } catch (error) {
	        // User denied account access...
	      }
	    }
	    // Legacy dapp browsers...
	    else if (window.web3) {
	      App.web3Provider = web3.currentProvider
	      window.web3 = new Web3(web3.currentProvider)
	      // Acccounts always exposed
	      web3.eth.sendTransaction({/* ... */})
	    }
	    // Non-dapp browsers...
	    else {
	      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
	    }
	  },

	  loadAccount: async () => {
	  	App.account = web3.eth.accounts[0]
	  },

	  loadContract: async () => {
	  	const SocialNetwork = await $.getJSON('SocialNetwork.json')
	  	App.contracts.SocialNetwork = TruffleContract(SocialNetwork)
	  	App.contracts.SocialNetwork.setProvider(App.web3Provider)
	  	App.SocialNetwork = await App.contracts.SocialNetwork.deployed()
	  },

	  render: async () => {
	  	if (App.loading) {
	  		return
	  	}
	  	App.setloading(true)
	  	$('#account').html(App.account)
	  	App.renderTasks()
	  	App.setloading(false)
	  },

	  renderTasks: async () => {
	  	 const postCount = await App.SocialNetwork.postCount()
	  	 const $template = $('.card')

	  	 for (var i=1; i<=postCount; i++) {
	  	 	const post = await App.SocialNetwork.posts(i)
	  	 	const postId = post[0].toNumber()
	  	 	const postContent = post[1]
	  	 	const postAuthor = post[2]
	  	 	const postTip = post[3].toNumber()
	  	 	const postTip_converted = await window.web3.fromWei(postTip, 'ether')
	  	 	const $newTemplate = $template.clone()
	  	 	$newTemplate.find('.author_address').html(postAuthor)
	  	 	$newTemplate.find('.content').html(postContent)
	  	 	$newTemplate.find('.tipper').prop('name', postId).on('click', App.tipPost)
	 		// const tipper = $newTemplate.find('.tipper')
	 		// console.log(postTip_converted)
			$newTemplate.find('.tipamount').html("Total Tip: " + postTip_converted + " ETH")		
	 		$('#content').append($newTemplate)
	 		$('#content').append("<br>")
	 		// $('.tipamount').append(tipper)
	 		// const tipperprop = $newTemplate.find('.tipper').prop('name', postId).on('click', App.tipPost)
	 		$newTemplate.show()
	  	 }
	  },

	  tipPost: async (e) => {
	  	const postId = e.target.name
	  	App.setloading(false)
	  	// const Web3 = require('web3');
	  	// const web3 = new Web3('http://localhost:7545');
	  	let tipamount = await window.web3.toWei('0.1', 'ether')
	  	// console.log(tipamount)
	  	// uint256 tipamount = 100000000000000000
	  	// let tipAmount = '100000000000000000'
	  	web3.eth.getCoinbase(function(err, account) {
	  		App.currentaddress = account
	  	})
	  	let account = App.currentaddress
	  	await App.SocialNetwork.tipPost(postId, {value: tipamount, from: account})
	  	window.location.reload()
	  },

	  CreatePost: async () => {
	  	App.setloading(true)
	  	const content = $('#postinput').val()
	  	await App.SocialNetwork.CreatePost(content);
	  	window.location.reload()
	  },

	  setloading: (boolean) => {
	  	App.loading = boolean
	  	const loader = $('#loader')
	  	const content = $('#content')
	  	if (App.loading) {
		  	loader.show()
	  		content.hide()
	  	}else {
	  		loader.hide()
	  		content.show()
	  	}
	  	
	  }
}

$ (() => {
	$(window).load(() => {
		App.load()
	})
})