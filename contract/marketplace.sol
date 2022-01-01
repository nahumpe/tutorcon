// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
    function transfer(address, uint256) external returns (bool);

    function approve(address, uint256) external returns (bool);

    function transferFrom(
        address,
        address,
        uint256
    ) external returns (bool);

    function totalSupply() external view returns (uint256);

    function balanceOf(address) external view returns (uint256);

    function allowance(address, address) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

contract TutorCon {
    uint256 internal tutorsLength = 0;
    uint256 internal postsLength = 0;
    uint256 internal hiresInfoLenght = 0;
    address internal cUsdTokenAddress =
        0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    struct Tutor {
        address payable profile;
        string name;
        uint256[] posts;
    }

    struct Post {
        uint256 tutorIndex;
        string title;
        string description;
        uint256 subject;
        uint256 price;
    }

    struct HireInfo {
        uint256 postIndex;
        uint256 hoursHired;
    }

    mapping(uint256 => Tutor) internal tutors;

    mapping(uint256 => Post) internal posts;

    mapping(address => uint256[]) internal hireIndex;

    mapping(uint256 => HireInfo) internal hiresInfo;

    function registerTutor(string memory _name) public {
        uint256[] memory _posts;
        tutors[tutorsLength] = Tutor(payable(msg.sender), _name, _posts);
        tutorsLength++;
    }

    function addPost(
        uint256 _tutorIndex,
        string memory _title,
        string memory _description,
        uint256 _subject,
        uint256 _price
    ) public {
        posts[postsLength] = Post(
            _tutorIndex,
            _title,
            _description,
            _subject,
            _price
        );
        postsLength++;
    }

    function getTutor(uint256 _index)
        public
        view
        returns (
            address payable,
            string memory,
            uint256[] memory
        )
    {
        return (
            tutors[_index].profile,
            tutors[_index].name,
            tutors[_index].posts
        );
    }

    function getPost(uint256 _index)
        public
        view
        returns (
            uint256,
            string memory,
            string memory,
            uint256,
            uint256
        )
    {
        return (
            posts[_index].tutorIndex,
            posts[_index].title,
            posts[_index].description,
            posts[_index].subject,
            posts[_index].price
        );
    }

    function getHireInfo(uint256 _index)
        public
        view
        returns (uint256, uint256)
    {
        return (hiresInfo[_index].postIndex, hiresInfo[_index].hoursHired);
    }

    function hireTutor(uint256 _index, uint256 _numHours) public payable {
        uint256 newPrice = posts[_index].price * _numHours;
        require(
            IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                tutors[posts[_index].tutorIndex].profile,
                newPrice
            ),
            "Transfer failed."
        );
        hiresInfo[hiresInfoLenght] = HireInfo(_index, _numHours);
        hireIndex[msg.sender].push(hiresInfoLenght);
        hiresInfoLenght++;
    }

    function getHireIndex(address _profile)
        public
        view
        returns (uint256[] memory)
    {
        return (hireIndex[_profile]);
    }

    function getTutorsLength() public view returns (uint256) {
        return (tutorsLength);
    }

    function getPostsLength() public view returns (uint256) {
        return (postsLength);
    }
}
