// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.34;

contract UserAuth {
    enum UserType {
        Reader,
        Author
    }

    struct User {
        string userName;
        bool onboarded;
        UserType userType;
        string profileUrl;
    }

    mapping(address => User) public users;

    event UserCreated(address indexed _addr, uint timestamp);
    event UserUpdated(address indexed _addr, uint timestamp);

    function getUserInfo() public view returns (User memory) {
        require(isUser(msg.sender), "Not a registered user");
        return users[msg.sender];
    }

    function isUser(address _addr) public view returns (bool) {
        return users[_addr].onboarded;
    }

    function setUserInfo(
        string calldata _username,
        UserType _usertype,
        string calldata _profileUrl
    ) public returns (bool) {
        require(bytes(_username).length > 0, "Username required");

        bool isNewUser = !isUser(msg.sender);

        users[msg.sender] = User(_username, true, _usertype, _profileUrl);

        if (isNewUser) {
            emit UserCreated(msg.sender, block.timestamp);
        } else {
            emit UserUpdated(msg.sender, block.timestamp);
        }

        return true;
    }
}
