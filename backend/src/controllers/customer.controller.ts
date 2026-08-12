
import type { Request, Response } from "express";
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  createCustomerFollowUp,
  getCustomerFollowUps
} from "../services/customer.service";

export async function createCustomerController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const {
      customerName,
      mobile,
      email,
      businessName,
      gstNumber,
      customerType,
      address,
      status,
      followUpDate,
      notes
    } = req.body ?? {};

    if (!customerName || !mobile || !customerType || !address) {
      res.status(400).json({
        message:
          "Customer name, mobile, customer type and address are required"
      });
      return;
    }

    const validCustomerTypes = [
      "RETAIL",
      "WHOLESALE",
      "DISTRIBUTOR"
    ];

    if (!validCustomerTypes.includes(customerType)) {
      res.status(400).json({
        message:
          "Customer type must be RETAIL, WHOLESALE or DISTRIBUTOR"
      });
      return;
    }

    const customer = await createCustomer({
      customerName,
      mobile,
      email,
      businessName,
      gstNumber,
      customerType,
      address,
      status,
      followUpDate,
      notes
    });

    res.status(201).json({
      message: "Customer created successfully",
      customer
    });
  } catch (error) {
    console.error("Create customer error:", error);

    res.status(500).json({
      message: "Failed to create customer"
    });
  }
}

export async function getCustomersController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search
        : undefined;

    const page =
      typeof req.query.page === "string"
        ? Number(req.query.page)
        : 1;

    const limit =
      typeof req.query.limit === "string"
        ? Number(req.query.limit)
        : 10;

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      res.status(400).json({
        message:
          "Page must be >= 1 and limit must be between 1 and 100"
      });
      return;
    }

    const result = await getCustomers(
      search,
      page,
      limit
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Get customers error:", error);

    res.status(500).json({
      message: "Failed to fetch customers"
    });
  }
}

export async function getCustomerByIdController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const customerId = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;

    if (!customerId) {
      res.status(400).json({
        message: "Customer ID is required"
      });
      return;
    }

    const customer = await getCustomerById(customerId);

    if (!customer) {
      res.status(404).json({
        message: "Customer not found"
      });
      return;
    }

    res.status(200).json({
      customer
    });
  } catch (error) {
    console.error("Get customer error:", error);

    res.status(500).json({
      message: "Failed to fetch customer"
    });
  }
}

export async function updateCustomerController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const customerId = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;

    if (!customerId) {
      res.status(400).json({
        message: "Customer ID is required"
      });
      return;
    }

    const customer = await updateCustomer(
      customerId,
      req.body ?? {}
    );

    if (!customer) {
      res.status(404).json({
        message: "Customer not found"
      });
      return;
    }

    res.status(200).json({
      message: "Customer updated successfully",
      customer
    });
  } catch (error) {
    console.error("Update customer error:", error);

    res.status(500).json({
      message: "Failed to update customer"
    });
  }
}

export async function deleteCustomerController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const customerId = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;

    if (!customerId) {
      res.status(400).json({
        message: "Customer ID is required"
      });
      return;
    }

    const deletedCustomer =
      await deleteCustomer(customerId);

    if (!deletedCustomer) {
      res.status(404).json({
        message: "Customer not found"
      });
      return;
    }

    res.status(200).json({
      message: "Customer deleted successfully"
    });
  } catch (error) {
    console.error("Delete customer error:", error);

    res.status(500).json({
      message: "Failed to delete customer"
    });
  }
}
export async function createCustomerFollowUpController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const customerId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const { followUpDate, notes } = req.body ?? {};

    const user = (req as Request & {
      user?: { userId: string };
    }).user;

    if (!customerId) {
      res.status(400).json({
        message: "Customer ID is required"
      });
      return;
    }

    if (!followUpDate) {
      res.status(400).json({
        message: "Follow-up date is required"
      });
      return;
    }

    if (!user?.userId) {
      res.status(401).json({
        message: "Authenticated user not found"
      });
      return;
    }

    const customer = await getCustomerById(customerId);

    if (!customer) {
      res.status(404).json({
        message: "Customer not found"
      });
      return;
    }

    const followUp = await createCustomerFollowUp({
      customerId,
      followUpDate,
      notes,
      createdBy: user.userId
    });

    res.status(201).json({
      message: "Customer follow-up created successfully",
      followUp
    });
  } catch (error) {
    console.error("Create customer follow-up error:", error);

    res.status(500).json({
      message: "Failed to create customer follow-up"
    });
  }
}
export async function getCustomerFollowUpsController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const customerId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!customerId) {
      res.status(400).json({
        message: "Customer ID is required"
      });
      return;
    }

    const customer = await getCustomerById(customerId);

    if (!customer) {
      res.status(404).json({
        message: "Customer not found"
      });
      return;
    }

    const followUps = await getCustomerFollowUps(customerId);

    res.status(200).json({
      customerId,
      followUps
    });
  } catch (error) {
    console.error("Get customer follow-ups error:", error);

    res.status(500).json({
      message: "Failed to fetch customer follow-ups"
    });
  }
}