package com.tericcabrel.osiris.controllers;

import javax.validation.Valid;

import com.tericcabrel.osiris.dtos.UserRegistrationDto;
import com.tericcabrel.osiris.utils.Helpers;
import com.tericcabrel.osiris.models.User;
import com.tericcabrel.osiris.services.interfaces.UserService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/register")
public class RegisterController {
    private UserService userService;

    public RegisterController(UserService userService) {
        this.userService = userService;
    }

    @ModelAttribute("user")
    public UserRegistrationDto userRegistrationDto() {
        UserRegistrationDto userRegistrationDto = new UserRegistrationDto();

        userRegistrationDto.setUid(Helpers.generateRandomString());

        return userRegistrationDto;
    }

    @GetMapping
    public String showRegisterForm(Model model) {
        return "register";
    }

    @PostMapping
    public String registerUser(
            @ModelAttribute("user") @Valid UserRegistrationDto userDto,
            BindingResult result
    ) {

        User existing = userService.findByUid(userDto.getUid());
        if (existing != null) {
            result.rejectValue("uid", null, "There is already an account registered with that uid");
        }

        if (result.hasErrors()) {
            return "register";
        }

        userService.save(userDto);

        // TODO Send confirmation email

        return "redirect:/register?success";
    }
}
