// binary tree
#include<iostream>

using namespace std;

class Node {
public:
    int data;
    Node* left;
    Node* right;
    
    Node(int val) {
        data = val;
        left = NULL;
        right = NULL;
    }
};

class BinaryTree {
public:
    Node* root;
    
    BinaryTree() {
        root = NULL;
    }
    
    // Insert a node in the binary tree
    Node* insert(Node* node, int data) {
        if (node == NULL) {
            return new Node(data);
        }
        
        if (data < node->data) {
            node->left = insert(node->left, data);
        } else {
            node->right = insert(node->right, data);
        }
        
        return node;
    }
    
    // Inorder traversal (Left, Root, Right)
    void inorder(Node* node) {
        if (node == NULL) return;
        
        inorder(node->left);
        cout << node->data << " ";
        inorder(node->right);
    }
    
    // Preorder traversal (Root, Left, Right)
    void preorder(Node* node) {
        if (node == NULL) return;
        
        cout << node->data << " ";
        preorder(node->left);
        preorder(node->right);
    }
    
    // Postorder traversal (Left, Right, Root)
    void postorder(Node* node) {
        if (node == NULL) return;
        
        postorder(node->left);
        postorder(node->right);
        cout << node->data << " ";
    }
    
    // Search for a value in the tree
    bool search(Node* node, int key) {
        if (node == NULL) return false;
        
        if (node->data == key) return true;
        
        if (key < node->data) {
            return search(node->left, key);
        } else {
            return search(node->right, key);
        }
    }
};

int main() {
    BinaryTree tree;
    
    // Insert nodes
    tree.root = tree.insert(tree.root, 50);
    tree.insert(tree.root, 30);
    tree.insert(tree.root, 70);
    tree.insert(tree.root, 20);
    tree.insert(tree.root, 40);
    tree.insert(tree.root, 60);
    tree.insert(tree.root, 80);
    
    cout << "Inorder traversal: ";
    tree.inorder(tree.root);
    cout << endl;
    
    cout << "Preorder traversal: ";
    tree.preorder(tree.root);
    cout << endl;
    
    cout << "Postorder traversal: ";
    tree.postorder(tree.root);
    cout << endl;
    
    int searchKey = 40;
    if (tree.search(tree.root, searchKey)) {
        cout << searchKey << " found in the tree" << endl;
    } else {
        cout << searchKey << " not found in the tree" << endl;
    }
    
    return 0;
}
