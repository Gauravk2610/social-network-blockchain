pragma solidity ^0.5.0;

contract SocialNetwork {
    
    string name;
    uint public postCount ;
    
    struct Post {
        uint id;
        string content;
        address payable author;
        uint tipamount;
    }
    
    mapping(uint => Post) public posts;
    
    event PostCreated(
        uint id,
        string content,
        address payable author,
        uint tipamount
        );
        
    event PostTipped(
        uint id,
        string content,
        address payable author,
        uint tipamount        
        );
    
    constructor () public {
        name  = "Gaurav's Social Media";
    }
    
    function CreatePost(string memory _content) public {
        require(bytes(_content).length > 0);
        postCount ++;
        posts[postCount] = Post(postCount, _content, msg.sender, 0);
        emit PostCreated(postCount, _content, msg.sender, 0);
    }
    
    function tipPost(uint _id) public payable {
        require(_id > 0 && _id <= postCount);
        Post memory _post = posts[_id];
        address payable _author = _post.author;
        address(_author).transfer(msg.value);
        _post.tipamount = _post.tipamount + msg.value;
        posts[_id] = _post; 
        emit PostTipped(postCount, _post.content, _author, _post.tipamount);        
    }
}